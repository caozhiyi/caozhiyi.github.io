# I/O Multiplexing and High-Performance Network Programming

I/O multiplexing feels almost retro at this point. Dan Kegel posed the C10K problem at the turn of the century. Linux 2.6 introduced epoll. Nginx eventually showed how to do fully async I/O at the application layer. Somewhere along that line, single-machine concurrency stopped being a research topic and became a solved problem with a standard answer. Then the post-microservices era arrived — cloud-native everything, infrastructure that makes large-scale deployment trivial — and people more or less stopped talking about per-machine throughput. High-level languages like Java and Go keep extending their reach, the network APIs they expose get more and more abstracted, and the underlying I/O multiplexing primitives drift further away from day-to-day application code. Some engineers writing services today have never actually touched a `socket()` call.

But underneath all the abstraction, network programming has the same north star it's always had: **monitor the maximum number of connections with the minimum amount of resources.** This piece walks back to that origin point and works upward — from the raw `socket` API to event loops, buffer management, and the way modern languages package all of this for you.

Let's start with the socket API.

---

## The Socket API

Computer networking is one of the great inventions of the 20th century, and it spread faster than its inventors expected. It's what wired billions of endpoints into a single fabric and ultimately produced the internet — the third great wave of the information revolution, still rolling.

Modern operating systems wrap the network stack inside the kernel and expose TCP/UDP interfaces to userspace. Those interfaces are how user-level code reads and writes the network. TCP carries 80%+ of internet traffic these days, so we'll center on TCP — UDP follows the same shape.

### 1. `socket`

```c
int socket(int domain, int type, int protocol);
```

The starting point. This call asks the OS for a socket resource and returns a userspace descriptor. The kernel sets up everything that goes with it: receive buffer, send buffer, congestion control state, TCP state machine, and so on.

### 2. `bind`

```c
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

Bind the socket to a local port. The kernel uses IP to address the host, and the port to address the user-space application.

### 3. `listen`

```c
int listen(int sockfd, int backlog);
```

Start listening for incoming connections.

### 4. `accept`

```c
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
```

Pick up a new connection. The new socket returned by `accept` has already finished its three-way handshake inside the kernel.

### 5. `send`

```c
ssize_t send(int sockfd, const void *buf, size_t len, int flags);
```

Send data. The kernel copies the bytes from user-space memory into the send buffer.

### 6. `recv`

```c
ssize_t recv(int sockfd, void *buf, size_t len, int flags);
```

Receive data. The kernel copies bytes from the receive buffer into user-space memory.

### 7. `close`

```c
int close(int fd);
```

Close the socket. The side that calls `close` first initiates the four-way termination handshake.

### 8. `connect`

```c
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

Initiate an outbound connection. The client side uses this to start the three-way handshake.

These are the most basic primitives the OS exposes. The vast majority of TCP traffic, anywhere, ultimately rides through these calls. The three-way handshake and the four-way teardown are protocol-level details — the kind of thing that fills interview slides — but the focus here is the calls themselves.

---

## The Blocking Problem

Three of those calls behave differently from the rest, and they matter:

- **`accept`** — if no new connection has arrived, by default it blocks until one does.
- **`send`** — if the kernel send buffer is too full to take the data, it blocks until the protocol stack has flushed enough out.
- **`recv`** — if the receive buffer has nothing to read, it blocks until new data arrives.

Other calls might block too, but those three are the ones that hurt, because they're the ones a server hits over and over. Each blocking call eats real throughput.

Before I/O multiplexing existed, the prevailing pattern was: one thread blocks on a listening socket, accepts a connection, hands it off to a fresh thread (or a pooled one), and that thread blocks on `recv`/`send` for the lifetime of the connection. **One socket per thread.**

The problem? In *Software Performance: CPU* I already covered this — spinning up huge numbers of threads burns CPU on context switches and cache-line invalidations. Performance falls apart fast.

If "one socket per thread" doesn't scale, the obvious next idea is **multiple sockets per thread**. But you can't naively cram many sockets into one thread, because the moment one socket blocks, every other socket on that thread is frozen behind it. You need a way to ask "which socket needs attention right now?" and only act on that one.

First, get rid of the blocking. On Linux, set `O_NONBLOCK`:

```c
int32_t SocketNoblocking(uint64_t sock) {
    int32_t old_option = fcntl(sock, F_GETFL);
    int32_t new_option = old_option | O_NONBLOCK;
    fcntl(sock, F_SETFL, new_option);
    return old_option;
}
```

Now `accept`, `send`, `recv` won't block on success or failure. Two new questions immediately appear:

1. How do you tell whether the call actually did anything (got a real connection, sent real bytes, read real bytes — vs. simply returning because it was non-blocking)?
2. *When* should you call which socket?

---

## Life After Non-Blocking

The OS API resembles C-style functions, so the answer to question one looks like C-style error handling: check the return value, then check `errno`. Take `recv` on Linux:

1. Return value > 0 — bytes successfully copied from the kernel receive buffer into user memory. (When and how much the kernel buffered is invisible to user code.)
2. Return value == 0 — the connection was closed.
3. Return value < 0 — something went wrong; check `errno` to find out what.

`errno` definitions vary by OS, but on Linux:

- **`EAGAIN`** — the socket is non-blocking and the kernel has no data to read right now.
- **`EWOULDBLOCK`** — same as `EAGAIN`.
- **`EINTR`** — the call was interrupted by a signal; just retry.

With those, you can branch on `recv`'s outcome reliably.

Now question two — when do you call what? The naive answer: "I'll just spin in a tight loop, calling `recv` on every socket. If one returns nothing, move on to the next." Workable in theory, but two issues:

1. Sockets have both `send` and `recv`. Which do you call when, and in what order? (`accept` is essentially a read-event variant, so it folds into the same question.)
2. **A busy-spin pegs the CPU.** Power consumption is real. So is latency for *other* threads competing for the core.

The OS's first-generation answer to this was **`select`** and **`poll`**:

1. If no socket is currently readable/writable, the call blocks inside `select`/`poll`.
2. Once one or more sockets become ready, the call returns and tells you what's ready.

This is essentially a notification mechanism. In I/O-multiplexing parlance, "a socket has data to read or room to write" gets named a **read event** or **write event**. You register interest in those events with `select`/`poll`, and you get notified when they fire.

So why didn't the world stop there? Why did epoll, kqueue, IOCP come later?

The core problem with `select`/`poll`: **the kernel manages tracked sockets in a single, linear data structure** — `select` uses a fixed-size array, `poll` uses a linked list. When you register an interest, you append to that structure. When events fire, the call hands you the *entire* structure back. To find which socket actually fired, you have to scan the whole thing. With one thread tracking 10,000 sockets, every event triggers a full 10,000-entry scan. Untenable.

---

## The epoll Driver Model

With that backdrop, we can talk about **epoll** properly. (macOS's `kqueue` is essentially the same idea; Windows IOCP is shaped quite differently. This piece sticks to Linux, so epoll it is.)

What epoll has to answer:

1. *When* does an event happen?
2. *Which* sockets had events?
3. *What kind* of event was it — readable, writable?

It uses three calls.

### 1. Create the epoll instance

```c
int epoll_create(int size);
```

Returns an epoll descriptor. `size` was historically a hint for how many fds you'd watch. Linux 2.6.8+ ignores it and grows dynamically.

### 2. Manage the watch list

```c
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

- `epfd` — the descriptor from `epoll_create`.
- `op`:
  - `EPOLL_CTL_ADD` — add a new fd to the watch set.
  - `EPOLL_CTL_MOD` — modify an existing fd's interest mask.
  - `EPOLL_CTL_DEL` — remove an fd.
- `fd` — the target file descriptor. (Linux treats everything as a file, so this can be a regular file or a socket.)
- `event` — what to watch for (passing `NULL` is an error).

`epoll_event`:

```c
typedef union epoll_data {
    void    *ptr;      // user-supplied pointer
    int      fd;       // or just an fd
    uint32_t u32;
    uint64_t u64;
} epoll_data_t;

struct epoll_event {
    uint32_t     events;    // event mask
    epoll_data_t data;      // user data, returned as-is when the event fires
};
```

Common event flags:

- `EPOLLIN` — readable.
- `EPOLLOUT` — writable.
- `EPOLLRDHUP` — the peer closed (or shut down its write half).
- `EPOLLPRI` — urgent data (TCP out-of-band).
- `EPOLLERR` — error on the fd. (Always monitored; you don't have to set it.)
- `EPOLLHUP` — hangup. (Peer disconnected, etc.)
- `EPOLLET` — switch this fd into edge-triggered mode (default is level-triggered).
- `EPOLLONESHOT` — fire once, then stop monitoring this fd until you re-arm it.

### 3. Wait for ready events

```c
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

- `epfd` — the epoll descriptor.
- `events` — output array.
- `maxevents` — capacity of the output array (must be > 0).
- `timeout`:
  - `-1` — block indefinitely.
  - `0` — return immediately.
  - `> 0` — block for that many milliseconds.

Conceptually clean: create an epoll, register interests, wait. `epoll_wait` returns *only* the sockets that actually have events — none of the "scan everything to find the few that matter" overhead.

Because `epoll_wait` itself still blocks, this style of multiplexing is often called **half-blocking I/O multiplexing**. Truly async I/O multiplexing requires the OS to provide fully asynchronous APIs that push the entire scheduling work into the kernel — but in production today, half-blocking is still the dominant style.

---

## How epoll Actually Works

Inside the kernel, epoll uses two structures:

1. A **red-black tree** that holds every registered socket.
2. A **doubly linked list** of sockets that have currently fired events.

- `epoll_create` allocates both structures.
- `epoll_ctl` adds, modifies, or removes nodes in the red-black tree.
- `epoll_wait` returns the contents of the linked list.

That's it. The flow when a socket has a read event:

1. The NIC receives data and DMAs it into a pre-allocated buffer.
2. A hardware interrupt nudges the CPU to process the packet.
3. The kernel thread runs the protocol stack, identifies the five-tuple (protocol, source port, dest port, source IP, dest IP).
4. The five-tuple resolves to a unique socket. Data goes into that socket's receive buffer; a "socket ready" callback fires.
5. epoll's callback handler appends the socket to the doubly-linked list of ready sockets.
6. `epoll_wait` returns those sockets to user space.
7. User space processes them.

What user space then does with that list is what differentiates **level-triggered (LT)** and **edge-triggered (ET)** — the famously interview-friendly distinction:

1. **LT** — after the user space drains some data, the kernel re-checks whether the socket still has more readable data; if so, it stays in the active list and `epoll_wait` will return it again next time.
2. **ET** — once `epoll_wait` returns, the socket is removed from the list. You won't be notified again until *new* readable state arrives.

---

## Multi-threading

Epoll lets one thread handle many sockets. To go further, you want multiple threads. Now the questions multiply: one epoll instance per thread or one shared across threads? Where does the listening socket live? What happens if multiple threads `accept` at the same time? Anything involving threads gets complicated, and this is no exception.

### One epoll per thread, or one shared epoll?

This question is really about the relationship between a socket and a thread. **One epoll per thread** means a given socket's read/write events all wake up on the same thread; that thread owns the socket's entire lifecycle. **One shared epoll across threads** means a socket's events can wake up on any thread — which means you have to add your own synchronization to prevent multiple threads from operating on the same socket at once. epoll's API itself doesn't promise thread safety when multiple threads call `epoll_ctl` on the same socket either, so you'd need application-level locking.

### Where does the listening socket go?

One socket many threads, or many sockets per thread? Lock it, or let the OS handle it?

This is the classic **thundering herd** problem: a new connection wakes up many threads, but only one of them can `accept` it; the rest were dragged out of sleep for nothing. There are several knobs that interact with this. Combine them and you get something like:

| `EPOLLEXCLUSIVE` | `reuse_port` | listen sockets | epoll instances | threads | woken | accept-success | no thundering herd |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ❌ | ❌ | 1 | 1 | 8 | 1–2 | 1 | ❌ |
| ❌ | ❌ | 1 | 8 | 8 | 3–8 | 1 | ❌ |
| ❌ | ✅ | 8 | 1 | 8 | 1–2 | 1 | ❌ |
| ❌ | ✅ | 8 | 8 | 8 | 1 | 1 | ✅ |
| ✅ | ❌ | 1 | 1 | 8 | 1–2 | 1 | ❌ |
| ✅ | ❌ | 1 | 8 | 8 | 1 | 1 | ✅ |

Three workable strategies fall out of that:

1. **Hand the listen socket around between threads explicitly**, but only register the read-event interest in *one* thread at a time. Add a load-balancing rule so socket counts stay roughly even. This is Nginx's classic approach (Nginx is multi-process, but the principle is the same). Famous enough now that almost everyone has heard of it.
2. **`SO_REUSEPORT`.** Each thread owns its own listen socket, all bound to the same address and port. The kernel does the load balancing — when a connection comes in, the kernel decides which listening socket (and therefore which thread) gets woken. The catch: each listening socket has its own protocol-stack control block with its own half- and full-connection queues. If a thread dies, new connections that the kernel has already routed into that thread's queues will time out on the client.
3. **`EPOLLEXCLUSIVE`.** Set this flag on `epoll_ctl` registration and the kernel handles thundering-herd avoidance internally. Caveat: introduced in Linux 4.5, so check your kernel.

The classic shape that emerges: each worker thread runs its own loop, blocked in `epoll_wait`, then asynchronously processes whatever sockets fired, then returns to `epoll_wait`. **One loop per thread.**

---

## Buffer Management

Async networking and multi-threading aren't enough. Above the socket layer, you have to deal with application protocols — HTTP/1, HTTP/2, gRPC, whatever — all of which need a *complete* message before they can do anything useful. Take HTTP/1:

A request has three sections:

1. Request line.
2. Headers.
3. Body.

Each of those can be processed once received in full, but you don't get to receive each in full as a single chunk. Where the chunk boundaries fall is determined by TCP's congestion control, the sliding window, the kernel buffer size — TCP, sitting underneath, has no idea what HTTP packets look like and no responsibility for honoring them. So what happens when `recv` returns half of a request body? The application can't act on a partial body. The kernel buffer is fixed-size, and the moment you `recv` from it, the kernel reclaims that space.

You have to maintain your own buffer. And it should:

1. Hold a payload of unknown size — incoming data sizes are unpredictable.
2. Minimize memory copies for efficiency.

Use a **memory-pool-backed buffer.** Maintain a singly linked list of fixed-size memory blocks; manage all idle blocks through a memory pool. Reading and writing then become "advance a pointer left to right":

1. **Write** — check the tail block. If full, request a fresh block from the pool, append it, write into it.
2. **Read** — check the head block. After draining it, return the head block to the pool, advance head, read the next block.

Each block has its own read and write pointers, advancing only forward.

For efficient transfers in and out of this segmented buffer:

- **Upward** (toward application code) — wrap the buffer with protocol-aware operations so the application can parse without copying everything contiguously. For HTTP/1 this means things like "scan for `\r\n` across blocks."
- **Downward** (toward the kernel) — use **`readv`** and **`writev`**, the scatter/gather I/O primitives. These let you hand a list of segmented buffers directly to the kernel; the kernel copies once into your fragmented buffers (or out of them), no application-side stitching needed.

That's enough to give you a fully functional buffer.

---

## Java's NIO

Java engineers love to invoke NIO when high performance comes up. Java NIO ships three components: `Selector`, `Channel`, `Buffer`.

Walking it back to what we've already covered:

1. **`Selector`** — a wrapper over the underlying event-driven mechanism (epoll, kqueue, etc.). Different OSes provide different primitives; Java has to be portable, so `Selector` abstracts them.
2. **`Channel`** — a wrapper over a socket. Reads and writes on a channel ultimately call into the OS socket APIs.
3. **`Buffer`** — a wrapper over the buffer concept. Java provides two flavors: `HeapBuffer` (a.k.a. `ByteBuffer`) and `DirectBuffer`. `HeapBuffer`'s memory comes from inside the JVM and its lifecycle is GC-managed. `DirectBuffer` allocates directly on the OS heap, similar to `malloc`, and you manage its lifetime explicitly.

Why have `DirectBuffer` at all when `HeapBuffer` exists?

Briefly: Java's GC algorithms (Parallel GC, G1, etc.) all do compaction at some point — moving live objects together to reduce fragmentation. Now picture this: you call `channel.send(byteBuffer)`, and right after the kernel begins reading from your buffer's memory address, the GC kicks in and *moves the buffer*. Disaster. So even if you pass a `HeapBuffer`, the JVM internally creates a temporary `DirectBuffer`, copies the data into a fixed location, and sends from there.

Fundamentally the issue is GC's incompatibility with "memory whose address must remain stable for the duration of an operation." In principle the GC could be taught to pin in-flight buffers, but that complicates the GC implementation. `DirectBuffer` is the pragmatic answer.

---

## Go's Goroutine Magic

Go developers can write what looks like synchronous network code and get high-performance concurrency out of it. What's the trick?

There's no trick. As we've seen, the OS only offers half-blocking multiplexing primitives like epoll (full-async APIs aren't widespread yet). So Go must be using those underneath. Goroutines are user-space lightweight scheduling units; the OS doesn't see them. When you call something like `send` in Go, the underlying *thread* doesn't actually block — the runtime parks the *goroutine* off the thread and schedules a different runnable goroutine onto it (the GMP model). When does the parked goroutine wake back up? *When epoll says the socket is ready.*

So in essence Go is **half-blocking event-driven multiplexing with a goroutine façade on top**:

1. On a blocking call, register the relevant event with epoll, swap the goroutine off.
2. When epoll says the socket is ready, mark the goroutine runnable again.

Open Go's runtime source and you'll find the epoll wrapper sitting right there.

Tencent's open-source `libco` does the same thing more directly — it hooks `send`, `recv`, etc. and replaces them. When the application calls `recv`, libco yields the current coroutine, registers the socket with epoll, and on `epoll_wait` wakes the coroutine back up. From the caller's perspective it's a normal blocking `recv`. Synchronous coding style, async runtime — no callback hell.

These are all **stackful** coroutines. What about **stackless** coroutines?

The distinction:

1. **Stackful coroutines** — each coroutine has its own call stack. Switching means swapping the CPU registers to point at a different stack. Switching can happen anywhere; the coroutine's user code never knows. Most "goroutine-style" coroutines are this kind.
2. **Stackless coroutines** — fundamentally a state machine, generated at compile time. The compiler tags coroutine functions and emits different code for each "stage." Switches follow the function-call shape; you can't switch at arbitrary points. The user has to mark suspension points with keywords like `co_await`.

In a stackless coroutine, calling `recv` works like this: the compiler splits the function into two halves at the `co_await` boundary. The first half runs up to the `recv` call — at that point the function returns, the state machine marks "stage 1 complete," and the socket is registered with epoll for read events. Once `epoll_wait` reports the event, the state machine resumes execution from after the `recv` call.

---

## Wrapping Up

Coming up on ten thousand words. We started from the raw socket API, walked through async I/O, talked through buffer design, and got into how high-level languages wrap all of this. Network programming is huge, and there are still big topics left untouched — zero copy, IOCP's Proactor model, the new `io_uring`. Even at this length, it's not exhaustive.

Looking back, the underlying mechanism is the same throughout. What changes is how each layer *packages* it. Which is another way of saying — once you understand the foundation, the rest snaps into place.

In server-side engineering, networking is the topic you don't get to skip. Whatever the language, whatever the framework — Nginx, Envoy, Pingora — they're all chasing better performance and more flexibility on top of the principles in this article. If this gets you to a point where the next time a related issue lands on your desk it doesn't feel completely opaque, that's enough for me.

Onward, together.
