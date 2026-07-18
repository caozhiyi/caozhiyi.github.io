# Why We Needed QUIC

Finally, finally, finally.

quicX is a complete QUIC and HTTP/3 library — from raw socket-level data reception at the bottom up to HTTP-layer interface semantics at the top — a fully featured, architecturally tuned implementation. It packs a lot of features, spans a lot of layers, and accumulates a lot of implementation detail. This piece zooms out: **what kinds of problems do you actually have to solve to implement a QUIC/HTTP/3 protocol library?**

I wrote a piece a while back called *What is HTTP/3*, which gave a kind of encyclopedia-style introduction to QUIC and HTTP/3 — features lined up next to each other, without much depth on the *why*. This piece flips that. Instead of cataloging features again, I want to trace the chain of cause and effect behind them — *knowing what is fine, but knowing why is the harder and more useful thing.* Let's start with: why did QUIC need to exist?

---

## I. Why We Needed QUIC

### The HTTP/1.x era

In the early HTTP/1.0 days, HTTP rode on TCP, and each request used its own TCP connection. Establishing a TCP connection is expensive — a three-way handshake plus a possible four-way TLS handshake, burning multiple RTTs before a single byte of data could move. As the web evolved and a single page could spawn dozens or hundreds of requests, redoing the whole dance each time became absurd.

HTTP/1.1 introduced **keep-alive** to reuse a TCP connection — arguably the single most important upgrade in HTTP/1.1. But reusing the connection introduced a new problem: HTTP/1.1 forced server responses to come back **in the same order** as the client's requests. If request #1 happened to be a slow query, the responses for the requests behind it — even if they were dispatched in milliseconds — had to queue up behind it. To work around the limit, browsers ended up opening multiple TCP connections per domain to scrape some concurrency back, which reintroduced the handshake overhead.

That's the **HTTP-level head-of-line blocking** problem.

### The HTTP/2 era

To address the application-layer head-of-line blocking, HTTP/2 introduced **multiplexing** and **binary framing**. A single TCP connection is virtualized into multiple streams, each with its own Stream ID. Data is split into binary frames and sent over those streams; whoever's done first can return first. From the application layer's perspective, the concurrency problem looked solved.

But underneath, HTTP/2 was still TCP. **TCP doesn't know what a Stream ID is.** It only sees its own sequence numbers. The moment the network drops a single TCP segment, the kernel TCP stack inflexibly holds back every later byte already sitting in the receive buffer until the missing segment is retransmitted and arrives. It doesn't matter that those bytes belong to a totally different HTTP stream. **TCP doesn't care; everything stalls.**

In a high-loss mobile environment, HTTP/2's multiplexing therefore turns into the opposite of what it advertised — every concurrent request stalls because of one missing packet. Same name, different beast: HTTP/1.1's HOL blocking was at the application layer; HTTP/2 hit **TCP-level HOL blocking**. Under bad enough conditions, HTTP/2 can perform worse than HTTP/1.1 with six parallel TCP connections.

Add to that the cost of TCP and TLS being separate, sequential layers — connection establishment still ate a serious RTT budget.

### QUIC's break from the line

To break the kernel-TCP straitjacket, Google proposed QUIC. The core idea: **drop TCP, embrace UDP, and rebuild reliable transport in user space on top of it.**

QUIC brings several fundamental shifts:

- **End head-of-line blocking for real.** QUIC has the concept of streams baked into the transport layer. Packet loss recovery between streams is fully independent — a loss on stream A doesn't block streams B and C.
- **Faster handshake.** TLS 1.3 is fused into transport-layer connection setup; first connection: 1 RTT to data; resumed session: **0-RTT** with business data carried in the first flight.
- **Connection migration.** TCP identifies a connection by the five-tuple {src IP, src port, dst IP, dst port, protocol}; a network switch (Wi-Fi → cellular) means the connection is gone. QUIC uses a user-space-negotiated **Connection ID** to keep the session alive across IP changes.

QUIC's ambitions are not small. The changes it makes to layer 4 are arguably bigger than the changes HTTP/3 makes to layer 7. TCP carries somewhere north of 80% of all internet traffic — QUIC is touching the core of the core.

---

## II. What You Have to Re-implement to Replace TCP

It's easy to wave your hand at this on a whiteboard. Throwing away the kernel's mature TCP stack means abandoning the most important reliability foundation the internet has had for the last forty years. To carry HTTP/3 — a protocol moving billions of requests — on top of unreliable UDP, you have to re-implement TCP's core capabilities in user space, and in some places do better than TCP did.

The following mechanisms are non-negotiable. Miss any of them and you don't have a workable transport.

### Flow control

Why flow control? **Receivers have finite memory**, and the application layer's consumption rate often lags the network's delivery rate. Without flow control, the sender floods data like a broken dam — blowing out the receiver's memory and wasting bandwidth, since data the receiver can't process gets dropped and retransmitted anyway.

TCP uses a connection-wide sliding window for flow control. QUIC, with multiplexing baked in, can't get away with a single-axis window. It needs **two-tiered flow control:**

- **Stream-level flow control.** Prevents one stream from monopolizing all of the receiver's memory. Each stream has a `MAX_STREAM_DATA` window: "this is how many more bytes you can send on this stream."
- **Connection-level flow control.** Caps the total in-flight bytes across all streams. Via `MAX_DATA` frames, the receiver bounds how many bytes total the connection can have outstanding at any moment.

The two windows interact carefully. When either tightens, the sender emits `DATA_BLOCKED` or `STREAM_DATA_BLOCKED` frames to notify the peer. When the application drains data and frees memory, the receiver emits window-update frames to wake the sender back up. The frame zoo and state-machine transitions involved are noticeably richer than TCP's.

### Congestion control

Flow control protects the receiver's memory; **congestion control protects the network in between.** When millions of devices push data into a shared pipe, exceeding the routers' capacity causes massive packet loss or congestion collapse. The sender has to infer the current pipe capacity — by watching latency rise, or by watching loss happen — and adjust its send rate accordingly.

TCP's congestion-control algorithms (Reno, CUBIC, BBR, etc.) live inside the OS kernel. Upgrading the algorithm means upgrading kernels across hundreds of thousands of servers — practically impossible for most companies. That's the structural reason new algorithms struggle to roll out across the internet.

QUIC moves congestion control entirely to user space. In a library like quicX, swapping algorithms is something you can do agilely. quicX provides an abstract congestion-control interface; underneath, it precisely measures **bottleneck bandwidth** and **min RTT**, paired with a **pacer** that smooths sends to avoid bursts. Even on a violently shaky mobile link, throughput stays comparatively stable. Kernel-bound TCP simply cannot match this flexibility.

### Loss detection and recovery

UDP is best-effort. Packets go out and the protocol forgets they ever existed. HTTP, on the other hand, must be reliable down to the byte. Which means **automatic repeat request (ARQ) machinery is mandatory** — the sender must know precisely which packets were lost, and retransmit promptly.

This is where one of TCP's classic difficulties shows up: **retransmission ambiguity.** Imagine TCP sends a packet for sequence range 100–200, doesn't see an ACK in time, and retransmits — also as 100–200. Some time later, an ACK for byte 200 arrives. **Is that ACK for the original packet, or for the retransmission?** If it's for the original, the network is just slow. If it's for the retransmission, the original was actually lost. TCP can't distinguish the two cases, which makes RTT measurement fuzzy, which then poisons retransmission timers and congestion-control judgments. TCP later added the timestamp option as a partial workaround, but the fix never quite goes all the way.

QUIC throws out the design entirely. It separates **the logical stream offset** from the **physical packet number**. In QUIC, packet numbers are strictly monotonically increasing — even if the same data has to be retransmitted, the retransmitted bytes go inside a packet with a brand new, larger packet number. Concretely: the packet carrying the bytes "Hello" is Packet 1, gets lost, and on retransmission those bytes go out as Packet 5. When the sender sees an ACK for Packet 5, it knows unambiguously that this is an acknowledgment of the retransmission. **Decades of TCP retransmission ambiguity, gone.**

Combine that with the PTO (Probe Timeout) mechanism specified in RFC 9002 and the use of ACK Delay frames to subtract out the receiver's processing time, and QUIC ends up with the most accurate RTT measurement and loss-recovery state machine to date. It's also one of the most complex modules in quicX.

### Encryption and security

The early-internet TCP was fully cleartext — any middlebox could peek at, or modify, the bytes. Worse, this caused **protocol ossification**: middleboxes (firewalls, routers) came to depend on fixed fields in the TCP header for inspection and filtering, so any change to the header risked getting silently dropped by them. TCP barely evolved for decades because of this.

QUIC was designed from day one to **trust no middlebox.** It mandates TLS 1.3 to encrypt application data, and goes further with **header protection** — even the packet number in the header is encrypted. To a middlebox, a QUIC packet is just a UDP datagram filled with random-looking bytes. No middlebox can read it; no middlebox can change it; no middlebox can ossify it.

Reproducing that security in a user-space library means integrating BoringSSL from scratch and following RFC 9001 strictly through key rotation: when to use the Initial Secret to decrypt handshake packets, when to derive the Handshake-level keys via HKDF, how to smoothly transition to the 1-RTT Application Secret. Each step has to be exact — one byte wrong and the handshake collapses.

### Performance scaffolding

Kernel TCP's robustness rides on top of OS-level thread scheduling and timer infrastructure. The moment you move the transport into a user-space process, you have to **rebuild that infrastructure yourself.**

A QUIC server's UDP socket can simultaneously carry tens of thousands of user connections, each of those connections carrying multiple streams. Per-connection PTO timers, idle-timeout heartbeats, per-peer delayed ACKs — these spawn enormous numbers of timer tasks at high frequency. Manage them with a priority queue or a brute-force scan and the CPU evaporates instantly.

In quicX's underlying infrastructure I implemented a **hierarchical timing wheel** for these timers, holding insert and trigger complexity at O(1). The threading model echoes the *one loop per thread* approach I covered in *I/O Multiplexing and High-Performance Network Programming* — each thread owns its event loop, paired with a custom memory-pool allocator to enable lock-free cross-thread data passing. From NIC ingress to protocol-stack decoding to the eventual business callback, copies and lock contention are kept as low as possible across the whole path.

---

## III. Closing

Each of the mechanisms above could justify a whole chapter on its own — and in fact, RFCs of considerable length already do. But that's the point: precisely because QUIC's changes are so foundational, it can answer many of TCP's long-standing limits and offer better performance, security, and user experience — especially for mobile and lossy-network environments.

This piece is a 30,000-foot view. Future pieces will pair quicX's implementation with each of these mechanisms for deeper analysis.

I worked on this on and off for over four years, and the HTTP/3 library is finally taking real shape:

quicX: [quicX](https://github.com/caozhiyi/quicX)

It implements most of what the RFCs spell out, and I'm still filling in the gaps.

Sharing it here, modestly. Onward, together.
