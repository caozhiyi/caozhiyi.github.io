# Memory Management, From the Bottom Up

In *Software Performance: CPU* and *Software Performance: I/O*, we approached performance from two different angles — compute and data movement. There's a topic that ran through both pieces without ever getting a chapter of its own: **memory.** CPU cache hits depend on memory layout. The Page Cache in the I/O piece is essentially a memory-scheduling story. Zero-copy is about reducing memory shuffling. GC architectures are about automating object lifetimes.

Memory is everywhere, like air, and we tend not to think about it — until something breaks. A leak. An OOM. Latency that suddenly stops being predictable. That's usually when you realize how thin your understanding actually was.

This piece tries to walk the full chain — from the OS down at one end, up to the application layer at the other — and stitch memory management into one coherent picture. It can't be exhaustive; treat it as a guided tour.

---

## Starting From Physical Memory

The earliest computers had programs operating on physical addresses directly. You'd use address `0x1000`, I'd use address `0x1000`, we'd run together and step on each other. Each program had to remember which addresses were free, which were in use, and one wrong step was disaster.

The OS's solution: give every process the *illusion* that it has the whole memory to itself. That's **virtual memory**.

Each process gets its own independent virtual address space. Process A can't read process B's memory. Compilers and linkers stop worrying about which physical address a program will be loaded at, because every process starts at the same virtual address. Even better: physical memory may be 16 GB, but the OS can hand each process a 128 TB virtual address space (on 64-bit systems) — most of it never gets used anyway.

How does virtual become physical? The OS keeps a **page table** mapping virtual pages to physical frames. The MMU inside the CPU walks the page table on every memory access to translate. To make that translation fast, the CPU also has a **TLB** caching recent mappings — a TLB hit costs about one cycle, a miss requires a multi-level page-table walk and is two orders of magnitude more expensive. Every pointer dereference, every array access in your code, runs that translation. It just runs invisibly because the hardware is fast enough.

With virtual memory, the OS lays out a standard address space for each process:

![Process virtual address space layout](/images/articles/understanding-memory-1-en.svg)

Code segment is loaded once and largely doesn't change; it's marked read-only to prevent stray writes. Data and BSS hold globals, lifetime equal to the process. The interesting parts are the last two — **stack** and **heap** — which represent two utterly different philosophies of memory management. We'll get to them shortly.

So far, process isolation and address-space uniformity are solved. But virtual memory introduces a new question: **when does the OS actually allocate physical memory?**

---

## The OS's "IOU"

The answer is probably not what most people expect: when you `malloc` 1 GB, **the OS hasn't actually prepared 1 GB of physical memory for you.** It's only marked a region of your virtual address space as "this is yours, you can use it." That's all.

The actual physical allocation happens the first time you access that region. The CPU walks the page table, finds no mapping, raises a **page fault**, hands control to the OS. The OS allocates a physical frame, builds the mapping, returns control. The whole thing is transparent to the program but adds microseconds of latency.

This is OS overcommit — **promise first, deliver later.** The win: extreme memory efficiency. Allocate 1 GB but only use 10 MB? Only 10 MB of physical memory is actually consumed. The risk: when too many processes try to *cash in their IOUs* at the same time, physical memory really might run out.

When that happens, the OS has two roads:

- **Swap** — swap inactive pages to disk to free physical memory. The cost: next access to the swapped page takes milliseconds instead of microseconds.
- **OOM killer** — kill the process with the largest memory footprint. Crude, but effective.

In production, swap is essentially disabled. Memory-heavy services like Redis or Elasticsearch would rather get killed and restart than tolerate the unpredictable latency of swap — once swap kicks in, response times go from milliseconds to seconds, which for an online service is functionally equivalent to being down.

OK, so the OS handles physical memory: virtual addressing for isolation, page faults for on-demand allocation, swap and OOM as safety nets. But this layer is shared across all processes, and **every memory request to the OS means a syscall** — a user/kernel transition. If a program allocates and frees small objects hundreds of thousands of times per second, going into the kernel each time would be unwatchable.

Before we cover how user space tackles that, let's pull two specific regions of the address space — stack and heap — out for closer inspection.

---

## Stack vs. Heap: Two Lifetime Philosophies

Stack and heap both store dynamic data, but they're managed *very* differently. The difference isn't an implementation detail; it's a fundamental design trade-off, and understanding it is the foundation for everything that follows.

The **stack** is a contiguous region of memory referenced by a CPU register (SP, the stack pointer). On a function call, SP moves down to allocate space; on return, SP moves up to reclaim it. The whole allocation/deallocation flow is one assembly instruction — zero bookkeeping overhead. Better, stack memory access patterns are extremely regular and almost always hit CPU cache. The performance gap to heap allocation is orders of magnitude.

But the stack has two hard constraints. **Lifetime must be strictly LIFO** — values can't be held across function frames. **Space is bounded** — Linux defaults to 8 MB, Windows to 1 MB; exceed it and you get a stack overflow. Why this limit? Each thread needs its own contiguous stack region, and if stacks could be arbitrarily large, spawning thousands of threads would crash the system. (We'll come back to this when we get to Go's goroutines and the redesign that makes a million of them feasible.)

The **heap** has none of these constraints. `malloc` here, `free` there, the memory lives until you say otherwise. Flexibility is the heap's strength — and the source of all its problems. With lifetime no longer dictated by syntactic structure, **who decides when to free? How?** Free too early and you've got a dangling pointer. Free too late and you've got a leak. Never free and you exhaust resources. Almost everything in the rest of this piece is about answering that one question.

Rule of thumb: **if it can live on the stack, don't put it on the heap.** This is a performance issue, not a style issue. Later, when we discuss Go's escape analysis, we'll see how the compiler makes this judgment for you automatically.

The stack is handled by the language and compiler — not your problem. The heap is the problem. Heap management lands squarely on `malloc`.

---

## `malloc`: A User-Space Memory Pool

Most people think `malloc` calls the OS for memory. It doesn't. `malloc` is a user-space function provided by the C standard library (glibc) that maintains a **memory pool** *inside your process*. If the pool has stock, it carves a chunk for you. If the pool is empty, it goes to the OS to refill.

The OS's wholesale channels into a process — corresponding exactly to the two regions in the address-space layout above — are:

- **`brk`/`sbrk`** — moves a "heap top" pointer, growing the process's heap region toward higher addresses. The shape of this API determines that the heap is **a single contiguous region growing in one direction.** No "multiple heaps," no carving holes in the middle. Fast and simple. The downside: returning memory to the OS can only happen by shrinking from the top down — empty space in the middle stays trapped.
- **`mmap`** — maps an anonymous region somewhere outside the heap, completely independent of `brk`. `munmap` returns the region to the OS immediately, with none of the heap-trapping problem.

glibc's policy is straightforward: allocations under 128 KB go through `brk`, allocations above 128 KB go through `mmap`. Small allocations tend to be short-lived and frequently reused, so leaving them in the heap to be re-carved makes sense. Large allocations have clearer lifetimes; when they go away, `mmap` can return them cleanly without leaving giant holes that block heap shrinking later.

Either way, there are two costs. **First, syscall overhead** — entering the kernel, switching context, updating page tables. A `brk`/`mmap` call costs hundreds of nanoseconds at minimum, microseconds at the high end. **Second, granularity mismatch** — `brk` and `mmap` deal in OS pages (typically 4 KB). Ask for 20 bytes and the OS still hands over a page; `brk` advances by page-aligned amounts, never just 20 bytes.

So the picture sharpens: if every `malloc` went straight to `brk`/`mmap`, syscall overhead would crush throughput at tens of thousands of allocations per second, and 20-byte requests would each cost an entire page.

`malloc`'s value reveals itself: **a caching and scheduling layer inside the process.** Wholesale a big chunk from the OS (say, 132 KB), then carve it up in user space into 8-byte, 37-byte, 512-byte slices. `free`'d memory doesn't go back to the OS immediately — it goes back into the pool and is reused on the next `malloc`. Tens of thousands of `malloc`/`free` calls compress into a handful of `brk`/`mmap` calls, and syscall and alignment waste both amortize to near zero. Same pattern as the Page Cache in the I/O piece: insert a cache between two layers that talk frequently, swap space for time.

OK — so what's inside the user-space pool?

---

## Allocator Trade-offs

glibc's `malloc` is **ptmalloc2**. Its core problem: a stream of allocations and frees of varying sizes, all happening fast, has to be served quickly while wasting as little memory as possible.

Before we go further, let's clear up a term that's frequently confused — **fragmentation**. There are two distinct kinds, with different causes and different remedies:

- **Internal fragmentation.** You ask for 20 bytes, the allocator gives you 32. The extra 12 bytes you can't use and can't free. This is the price of alignment and class-based bookkeeping — the allocator can't keep a separate freelist for every possible size, so it rounds up to the nearest size class (8, 16, 32, 64...). Finer classes mean less internal fragmentation but more overhead.
- **External fragmentation.** Total free memory is 100 MB, but it's chopped into countless tiny intervals, the largest of which is only 1 MB. You ask for 10 MB and the allocator stares at the ceiling — the space exists, but it can't be handed out. External fragmentation is caused by irregular allocate/free orderings and is closely tied to the allocator's design.

The two are the central tension in allocator design. Reducing internal fragmentation requires fine-grained size classes, but that aggravates external fragmentation. Reducing external fragmentation requires coalescing adjacent free blocks, but coalescing followed by re-splitting reintroduces internal fragmentation. Different allocators (and different languages) are different choices on this spectrum.

Back to ptmalloc2. The underlying intuition is shelving in a real warehouse — screws and engines don't share a rack. ptmalloc2 partitions free blocks by size:

- **Fast Bins** — blocks under 64 bytes. LIFO, very fast allocate/free, no coalescing. The convenience-store snack rack.
- **Small Bins** — exact-size matching, each bin holds blocks of one specific size.
- **Large Bins** — bigger blocks, ranged by size; allocation requires scanning to find the best fit.
- **Unsorted Bin** — newly freed blocks land here first, deferred classification. The next allocation decides where they really belong.

That handles "fast and frugal." Then there's threading. If every thread fights one global lock to allocate, performance collapses. ptmalloc2 introduces **arenas** — each thread can have its own arena with its own pool, slashing lock contention.

So allocation is mostly handled. What about release? Where does memory go when you `free`?

The answer: **probably still inside your process.**

When you `free`, ptmalloc2 puts the block in the right bin, checks neighbors for adjacency, and coalesces them where possible. Only when the coalesced block is at the heap top *and* large enough does it consider shrinking the heap via `brk` to return memory to the OS. `mmap`'d allocations get `munmap`'d on free — that's clean.

Note the precondition: **the free block has to be at the heap top.** If the heap top has any small in-use block sitting on it, even a sea of free memory below can't be reclaimed.

![brk heap fragmentation](/images/articles/understanding-memory-2-en.svg)

That's why long-running services often see memory creep upward — not necessarily a leak, just fragmentation preventing release. Watch a process's RSS (resident set size) and you'll see it grow but rarely shrink, even after huge amounts of `free`. Most of that memory is still sitting in your process, waiting to be reused by the next `malloc`.

ptmalloc2 is general-purpose, but different scenarios have different pain points. High-concurrency short-connection services (lots of threads churning small objects) live and die by lock contention. Long-running stateful services live and die by fragmentation. So we have other allocators:

- **tcmalloc (Google)** — pushes thread-caching to the extreme. Each thread has a local cache; small-object allocation and free run entirely lock-free in the thread's local cache. It only talks to the central cache when its local cache runs dry or overflows. Crushes ptmalloc2 under heavy concurrency.
- **jemalloc (Facebook/FreeBSD)** — better fragmentation control. Multiple arenas, finer size classes, slab-style allocation; long-running services see lower fragmentation. Redis uses jemalloc.

Allocator choice is a trade-off across **allocation speed, fragmentation, and multithreading scale**. No silver bullet — only what fits.

---

## How Allocators "Bootstrap"

Easily overlooked but important: **when a program starts, the pool is empty. Where does the first `malloc` come from? How big a starting reserve does the allocator need?**

ptmalloc2's answer: **almost nothing.** The main arena is empty at process start. The first `malloc` triggers a `brk` that pushes the heap top up by a small chunk (typically around 132 KB) and carves up that chunk to satisfy the request. Subsequent shortages push it again — incremental, on demand. Each new thread gets a thread-local arena (default 64 MB of *virtual* address space — but again, virtual; physical memory is allocated via faults on actual writes) on its first `malloc`.

tcmalloc and jemalloc are the same shape: ThreadCache/Arena are lazy-initialized; freelists per size class start empty and only populate on first request, recursing up to the central cache, then to mheap, finally to the OS through `mmap`.

The benefit of "request as you grow" is fast process startup and low idle memory footprint. The cost is **a series of small "growth pangs" over the process's life** — each cache-level exhaustion is a slower path that may include a syscall. Long-lived production services typically pre-warm with a round of full-load traffic to fill all the caches and absorb the cold-start jitter ahead of time.

This design feels self-evident — but as we'll see soon, **Java goes the opposite way: pre-allocate the entire heap up front and stop talking to the OS at runtime.**

We've now covered the OS layer and the user-space allocators. Allocation and release mechanics are clear. But one fundamental question is still open: **who decides when to free?**

Different languages give very different answers. Below, we walk along the line of "how much do we trust the programmer?" — from C, which trusts the programmer absolutely, to Rust, which trusts them not at all, to Java and Go, which simply don't ask the programmer to think about it.

---

## C: The Programmer Manages It

In C, the answer is direct — the programmer manages it. `malloc` and `free`, in and out, plain as day. Which is the biggest problem — humans make mistakes. Forget `free` and you leak. `free` twice and the behavior is undefined. Use a freed pointer and you're a dangling pointer away from disaster. These three mountains have crushed countless C programmers. The compiler can't catch any of them; they bloom in production weeks later in the most baroque ways.

C's answer trusts the programmer. The programmer isn't always trustworthy. The language evolution that follows is essentially everyone trying to answer one question: **can the compiler or runtime help carry this responsibility?**

---

## C++: The Compiler Inserts the `free` for You

C++ doesn't ditch manual management. It picks a clever pivot: **forgetting to release is the biggest problem; can the compiler insert the release at the right time automatically?**

C++'s answer is **RAII — Resource Acquisition Is Initialization** — bind a resource's lifetime to an object's lifetime. The whole mechanism rests on one C++ guarantee: **when a stack-allocated object goes out of scope, the compiler will call its destructor.** Put release logic in the destructor, and the programmer doesn't need to remember `free`; the compiler inserts the destructor call at every scope exit.

Built on this rule, C++ ships two smart pointers — two ownership models:

- **`unique_ptr`** — one block of memory, one owner. It's basically a wrapper around a raw pointer with `delete` in the destructor. Exclusive ownership means copying is forbidden (otherwise two pointers would `delete` the same block — double free); ownership transfers via `std::move`. Zero runtime overhead — the generated machine code is identical to hand-written `new`/`delete`.
- **`shared_ptr`** — for "multiple places need to hold the same object." Built on **reference counting**: a counter sits next to the managed object, copying increments it, destruction decrements it, **the moment the count hits zero the memory is automatically released** — no one calls `delete` explicitly; the last `shared_ptr` to leave handles it. The cost is much higher than `unique_ptr` — every counter tweak must be atomic (multi-thread safety), and every copy/destroy carries that cost. Worse: cyclic references — A holds B's `shared_ptr`, B holds A's — the count never reaches zero and you've leaked. C++ uses `weak_ptr` (a non-counting "observer") to break cycles, but the programmer has to spot the cycles. The compiler can't.

This is **half-automatic management at compile time** — the compiler inserts destructor calls at the right time, but the ownership design is still the programmer's job. Better than raw `malloc`/`free`, but it doesn't eliminate the problem class.

For extreme-performance workloads (game engines, high-frequency trading), C++ programmers often bypass `malloc` entirely and build their own memory pools — preallocate a big slab, manage allocations and frees by pointer arithmetic, control fragmentation precisely. The cost is that you're now writing your own allocator, which is rarely simple.

C++'s philosophy is: **trust the programmer, but give them better tools.** What if we don't trust them?

---

## Rust: The Compiler Decides for You

Watching C/C++ wrestle with memory safety for decades, Rust took the radical view: **if humans make mistakes, don't let them have the chance.**

Rust's ownership system kills memory-safety bugs at compile time with three rules. Briefly: every value has exactly one owner; values are released when their owner goes out of scope; values can be borrowed — but either many immutable borrows or one mutable borrow at a time. Violate these and the compiler refuses to build.

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;          // ownership moves to s2
    // println!("{}", s1); // compile error — s1 is invalid
    println!("{}", s2);    // fine
}   // s2 leaves scope — memory automatically released
```

No GC. Zero runtime overhead in the `Box` case. Memory safety is statically guaranteed by the compiler. The cost is that the compiler rejects a lot of "looks fine but might be wrong" code — fighting the borrow checker is a Rust newbie rite of passage, and ownership design is harder than just sprinkling `malloc`/`free`.

Fundamentally, Rust solves the same problem C++ smart pointers solve, but more thoroughly. C++'s smart pointers are *suggested* practice; Rust's ownership is *enforced* practice. C++ lets you fall back to raw pointers anywhere; Rust requires explicit `unsafe` to bypass the checks.

C++ and Rust share a key property: **ownership correctness is decided at compile time; there's no runtime scan to *guess* what's still alive.** A common misconception worth correcting — neither is *zero* runtime cost in all cases. `unique_ptr` and Rust's `Box` are zero-cost: the compiler inserts destructor calls and that's it. But `shared_ptr` and Rust's `Rc`/`Arc` rely on runtime reference counting — every assignment touches the atomic counter, hitting zero triggers release. The difference is that this overhead is **local, predictable, and one-to-one with each object**, instead of the GC's "stop everything and scan the heap."

Put differently: C++/Rust smear the runtime cost across each reference operation; GC concentrates it into bursts. Two very different cost models.

What if we don't want to think about ownership or borrow annotations at all?

---

## Java: The Runtime Cleans Up

Java goes a different way again. **The programmer only `new`s. They never `delete`.** Memory reclamation is the GC's job at runtime. This dramatically lowers the cognitive cost of programming and is one of the major reasons Java thrived in enterprise software.

GC isn't free. It has to answer one fundamental question: **which objects are still alive, and which have died?**

Start from a set of objects that are guaranteed alive (GC Roots — references on stacks, static variables, etc.), follow references transitively, mark every reachable object as live. Anything not reachable is dead. That's **marking**. Once that's done, dead objects' space has to be reclaimed — that's **sweeping**.

Done? Not quite. Step back and look at the heap after mark-sweep. Dead objects gone, but the heap is now riddled with holes — **isn't that exactly the external fragmentation we discussed in the `malloc` section?** Total free space might be huge but chopped into tiny intervals; the next allocation of a slightly larger object fails to find contiguous space. ptmalloc2 mitigates this with neighbor coalescing, but irregular alloc/free orderings always leave residual fragmentation.

JVM GC takes a more aggressive route: **compact.** Since new allocations would just deepen fragmentation, move every live object to one end of the heap. The other end becomes one big clean contiguous free region; the next allocation just bumps a pointer outward. Even the "find a suitable free chunk" step disappears.

![GC mark-sweep-compact](/images/articles/understanding-memory-3-en.svg)

This is a fundamental difference between GC and `malloc`: **`malloc` cannot move allocated memory** (your pointers would dangle), **but GC can** — every reference is under JVM control, so move an object and update every reference to it. That's why Java never exposes "object addresses" to you, only references. References are logical handles; the JVM decides where they map physically.

Mark, sweep, compact — three primitives. Real GC algorithms are different combinations and optimizations of the three:

- **Mark-Sweep** (no compaction) — fast, but leaves fragmentation. CMS for the old generation does this.
- **Mark-Compact** — eliminates fragmentation, but moving objects is expensive. The default for old gen.
- **Copying** — copy live objects from one region to a blank region; once copied, clear the original entirely. Essentially fuses "mark live + compact" into one step. But you need half the space sitting idle as the copy target, which is wasteful — only works when survival rate is low.

Where is "low survival rate"? Which brings us to the JVM's other cornerstone — **the generational hypothesis: most objects die young.** Temp objects created inside an HTTP request are dead by the time the request returns. Based on that, the JVM splits the heap into young and old generations and uses different algorithms for each:

- **Young gen** — survival rate is very low; GC finds only a handful of survivors. Copying wins — copy the few survivors, the rest of the space is just zeroed. The cost is keeping a chunk of space (Survivor) idle as the copy target, but with low survival rate, the wasted space stays small.
- **Old gen** — survival rate is high; copying is too expensive. Switch to mark-compact.

Generational GC has a second benefit: a young-gen GC scans only young gen, doesn't touch old gen — **smaller scan range, faster collection.** Most GCs resolve inside young gen; old-gen GC (Full GC) only fires when needed. This is the precondition that makes the whole JVM GC system run.

This sets up the answer to a question every Java newcomer has hit: **why does Java need `-Xmx4g` while Go, C, and Python never ask you for a heap size?**

The answer hides in this GC machinery. **Java's heap is never "request as you grow"** — the JVM, the moment it starts, asks the OS for **a contiguous virtual address space** of size `-Xmx`. Why?

- **Compaction needs contiguous space.** Copy-collection moves survivors from From to To, and both halves must live in one contiguous region. Mark-compact stuffs everything to "one end" of the heap — "one end" only makes sense if the heap has clear endpoints.
- **Generational layout needs fixed boundaries.** What fraction of the heap is young gen? How are Eden and Survivor split? How big is old gen? These ratios assume the total heap size is known.
- **Compressed pointers need a stable base.** To save memory in 64-bit JVMs at small heap sizes by using 32-bit references (with 8-byte alignment, up to 32 GB), the heap must have a fixed base address; every object address is an offset from that base. Move the heap and compressed pointers all break.
- **Card tables / remembered sets need a known heap size.** Cross-generational reference tracking is built on bitmap indexing of heap addresses. Heap size determines bitmap size, which must be allocated up front.

So `-Xmx` is not designer whim — it's a **hard precondition of the generational + compacting GC algorithm**. Pick that algorithm and you accept "carve out the field before opening for business."

What if you don't set `-Xmx`? The JVM picks a default (typically 1/4 of physical memory). In containers this guess goes badly — old JVMs don't read cgroup memory limits and see the host's total memory; they size the heap to 1/4 of the host, thinking they have 16 GB when the container limit is 2 GB, and OOM-kill almost immediately. That's why Java services in containers must explicitly set `-Xmx`, or use newer JVMs with `-XX:+UseContainerSupport`.

That's just "must specify a size." Java's heap, once carved out, sits there even if only 10% is in use, because nobody else can have that virtual address space. To avoid runtime expansion overhead, production environments typically set `-Xms` (initial size) equal to `-Xmx` — **request the full physical memory at startup as well**. A `-Xmx4g` Java process, even idle, will show several GB of RSS.

ptmalloc2, tcmalloc, etc. — extend on demand, use what you use, **no concept of "max heap size" because there is no concept of "total heap size."** Why Go also doesn't need it — coming up.

OK — mark, sweep, compact, generational. One headache left: **STW (Stop The World).** While GC is doing its work, business threads must pause. Marking has to walk the reference graph, and if business threads keep changing references during the walk, you'll miss live objects. Compaction moves objects, and if a business thread is touching one mid-move, it'll explode. Early Serial GC paused for seconds. Parallel GC got it down to hundreds of ms. Both fatal for online services.

The history of JVM GC is largely the history of shrinking STW. **CMS** (Concurrent Mark Sweep) ran marking concurrently with business threads, getting STW down to tens of ms. **G1** divided the heap into Regions and compacted only a subset at a time, achieving predictable pauses. **ZGC** introduced colored pointers and read barriers, letting compaction itself run concurrent with business threads, pushing STW into sub-millisecond territory. Different algorithms, same theme: **anything that can run concurrent should never STW; anything that has to STW should be fast.**

Low STW isn't free. The more concurrent the GC, the harder a thorny problem becomes: **what if business threads change references while GC is in the middle of marking?** GC just marked A unreachable; business thread turns around and lets some live object reference A again — A is now mislabeled. Solving this brings in **write barriers** — a snippet of code inserted at every reference assignment to notify the GC. The mechanism is cleaner to discuss in the Go section, where the GC depends on it more purely.

One more side effect quietly hidden by compaction: **objects move.** Pure Java code doesn't care; the JVM updates references. But anything that crosses the OS boundary becomes a disaster — recall **DirectBuffer** from the I/O piece. When you call `send`, the kernel needs a stable address to read from. If GC could move it mid-send, the kernel reads garbage. So Java introduced **off-heap memory** (DirectBuffer): not GC-managed, won't move, but the programmer has to manage its lifetime — **back to manual management.**

Java's approach: **trade runtime overhead for development efficiency, trade GC pauses for memory safety, and pay for the side effects of object movement with off-heap memory.** Three trade-offs stacked on each other — the source of JVM's gigantic GC tuning surface.

---

## Go: Redesigning Allocator and GC Together

Go's instinct: instead of fighting STW in the GC algorithm, **reduce the work the GC has to do in the first place — keep objects out of the heap whenever possible.**

The Go compiler does **escape analysis**: if a variable doesn't escape its function's scope, allocate it on the stack and reclaim it on return — GC never sees it. Only objects that genuinely need to live beyond the call frame go on the heap.

```go
func createUser() *User {
    u := &User{Name: "test"}  // escapes — pointer is returned
    return u
}

func processUser() {
    u := User{Name: "test"}   // stack — function-local
    fmt.Println(u.Name)
}
```

`go build -gcflags="-m"` shows the analysis. Go programmers internalize this — small objects passed by value, no unnecessary pointers, all to keep things on the stack. The rules roughly: returning a pointer to a local always escapes (the stack frame is gone after return); captured-by-closure usually escapes (the closure can outlive the function); a value passed as an `interface` usually escapes (interfaces can be held arbitrarily at runtime); too-large objects (big arrays) escape (the stack is finite); compile-time-unknown sizes escape (frame size must be compile-time known). Otherwise, the variable lives quietly on the stack, reclaimed on return, no GC involvement.

For objects that do go to the heap, Go's allocator borrows tcmalloc's three-tier cache: `mcache` (per-P, lock-free for small allocations) → `mcentral` (shared central cache) → `mheap` (global heap, ultimately backed by `mmap`). The hot path for small allocations is a pointer bump in the local mcache — even faster than C `malloc`.

Back to the question we left dangling — **why doesn't Go need `-Xmx`?** The answer is now in reach. Go's heap is not a pre-carved contiguous block. It's a collection of 64 MB **arenas** stitched together: when `mheap` needs more, it `mmap`s another arena; one arena fills, request another. Arenas are not even guaranteed contiguous in virtual memory; the runtime maintains an arena-index table to track them. **Because Go has no compaction, no generations, and no compressed pointers, it doesn't need a contiguous heap or a known total size** — those are hard requirements of Java's GC algorithm; Go skipping that algorithm skips the requirements too.

So **Java's pre-allocation and Go's grow-on-demand aren't stylistic choices — they're inevitable consequences of two different GC algorithms.** Java fences the playground first and invites kids in. Go lays new ground wherever the kids run. Both work; the fenced approach must decide playground size in advance; the lay-as-you-run approach never has to. The costs are clear too — Java's memory footprint is "whatever you declare," Go's is "whatever you actually used," but Go's runtime must continuously absorb arena-expansion overhead.

That's just allocation. The real interesting move is on the GC side. We saw Java can't escape mark-sweep-compact, with compaction being the most expensive step. Go made the opposite call here — **just don't compact.**

How does it avoid external fragmentation? The hint was already laid in the allocator section — **mcache size classes.** Go's heap is partitioned by size class from the start: all 16-byte objects in one set of pages, all 32-byte objects in another. A freed slot can be precisely refilled by another allocation of the same class. The "lots of free total but no contiguous block" problem doesn't arise.

Put another way: Go **trades fine-grained classification at allocation time for elimination of compaction at reclaim time.** The contrast with Java is sharp — Java carves memory however and relies on compaction to clean up; Go carves cleanly enough up front that compaction is unnecessary. The cost is some internal fragmentation (32-byte slot for a 20-byte request) and slightly slower large-object allocation (have to find contiguous pages at the heap level).

There's another payoff to skipping compaction — **physical addresses never change.** That means Go doesn't need an off-heap memory escape hatch. cgo calls, syscalls passing buffers, `mmap` mapping — anything that crosses runtime boundaries can use heap object addresses directly without worrying about the GC moving them. Major simplification of the runtime.

The cost of no compaction: only **mark-sweep**, no copying (copying *is* compaction). And without copying, generations lose much of their reason to exist — Java's generational efficiency leans on "low survival rate" + "copying" together; remove copying and the generational trick is much weaker. On top of that, escape analysis already keeps most short-lived objects on the stack, so the on-heap survival rate is naturally higher than in Java — the generational hypothesis has less leverage. So Go skips generations entirely; every GC scans the whole heap.

No generations + no compaction + concurrent execution puts an extreme demand on one thing — **correctness of concurrent marking.** Which brings us back to the question deferred earlier from the Java section: **how do you guarantee no live objects are missed when business threads keep mutating references during marking?**

Go uses **tri-color marking**: each object is white (unvisited, presumed dead), gray (visited but its references not yet processed), or black (visited; itself and its references all processed). GC starts at roots, marks them gray, repeatedly takes a gray object and grays each of its outgoing references while turning itself black. At the end, anything black is alive; everything still white is collected.

The concurrency hazard: GC has just finished scanning A (now black) and is about to scan C (gray). Business threads sneak in — they break C's reference to B, *and* let A reference B. GC keeps scanning C, never finds B; it won't revisit black A. B is alive but white — collected.

![Tri-color missed-mark scenario](/images/articles/understanding-memory-4-en.svg)

Classic **missed mark**. The exact preconditions: a white object becomes referenced by a black object, while every gray reference to it is broken. Disturb either condition and missed marks vanish.

Go's solution is the **write barrier**. The compiler inserts a small check next to every pointer assignment, but **this check only does real work during the GC mark phase** — at all other times it just checks a flag and returns; near-zero overhead. Once GC marking starts, the flag flips, the barrier activates: on every pointer assignment, Go's hybrid write barrier grays both the new target and the previous target, guaranteeing they'll be scanned this round. Better to over-mark than miss-mark. Over-marking just means scanning a few extra things that get collected next round; missed marks mean live objects get incorrectly freed and the program crashes. Pick your poison.

As for why Go can run a million goroutines while Java tops out at a few thousand threads — the answer is in Go's redesign of the stack.

A Java thread's stack is OS-level; the OS hands it a contiguous virtual address space at creation time, defaulting to 1 MB. 1 MB is nothing in 64-bit address space, but every thread takes one, and **stack size is fixed at allocation** because every variable address is an offset from the stack base — move the stack and every pointer breaks. So 10,000 threads costs 10 GB of virtual address, plus thread scheduling itself is kernel-level. A few thousand threads is the practical ceiling.

A Go goroutine stack is runtime-managed and starts at just 2 KB — smaller than one memory page. On function calls the runtime checks if the stack has room; if not, it **moves the entire stack** — allocate a bigger one, copy old contents, scan and update every pointer into the old stack. Sounds expensive; happens rarely; the upside is single-machine concurrency in the millions.

Why can Go move stacks but Java can't? **Because Go's runtime owns every goroutine stack and knows every stack frame's structure exactly** — it can find every pointer that needs updating. Same precondition that lets the GC move heap objects: precise references. OS threads can't do this, because the OS doesn't know your data structures and has to treat the stack as opaque bytes.

The Go memory story sums to: keep what can stay on the stack off the heap (escape analysis); make stacks themselves elastic and small (dynamic stacks); for what does go on the heap, kill external fragmentation up front via size classes (no compaction needed); reclaim concurrently with tri-color + write barrier (STW down to microseconds). The costs are slightly lower throughput (no generations means full-heap scans) and some internal fragmentation (size-class alignment) — for Go's target use case (high-concurrency servers), a clearly winning trade.

---

## Python / JavaScript: Simplicity First

If Java and Go are still meticulously trading off performance vs. safety, Python and JavaScript represent another preference — **developer efficiency first, runtime efficiency second.**

Python's primary mechanism is **reference counting**. Every object carries a counter. Increments on reference assignment, decrements on reference removal, release on zero. Reclamation is prompt; implementation is simple. But reference counting has one fatal flaw — **cycles**:

```python
a = []
b = []
a.append(b)  # a -> b
b.append(a)  # b -> a
del a
del b
# both still mutually reference each other; counters never reach zero
```

So Python tacks on a cycle detector that periodically scans the object graph and reclaims islands of mutually-referencing-but-otherwise-unreachable objects.

JavaScript (V8 in particular) uses generational GC similar to Java's: Scavenge in the young generation (copying), mark-sweep-compact in the old. V8's GC keeps evolving — concurrent marking, incremental marking — to reduce main-thread pauses.

In both, memory management is essentially invisible to the programmer. The cost: higher runtime memory usage and CPU overhead. But for their target domains (web, scripting, data work), that cost is acceptable.

---

## Summary

Looking back, there's one clear thread: **each layer compensates for the layer above's "not enough." Each compensation introduces new costs.**

- **OS** — virtual memory resolves the multi-process conflict over physical memory; the cost is page-table translation and page faults.
- **Allocators** — user-space memory pools resolve "syscalls are expensive"; the cost is fragmentation, addressed via size classes, arenas, and a family of allocators trading off speed/fragmentation/concurrency differently.
- **Language runtimes** — around the question "who decides when to free," languages diverge. C hands it to the programmer. C++ and Rust shift part of it to the compiler. Java and Go shift it entirely to the runtime. The runtime route then forks again: Java picks "pre-allocate + compact + generational," gaining the generational hypothesis efficiency at the cost of `-Xmx`, STW, and DirectBuffer; Go picks "grow on demand + size classes + no compaction," gaining stack elasticity and clean concurrent marking at the cost of generational gains. Python/JS pick reference counting first to optimize developer efficiency.

Lower layers offer more freedom and more danger. Higher layers offer more safety and more overhead. Where you draw your abstraction line, and which costs you accept, depends on which corner of the impossible triangle (performance / safety / development speed) your scenario lives in.

Memory management is one of those rare areas of computer science where **every layer reinvents the wheel**. The OS has its page allocator. The C library has its `malloc`. The language runtime has its object allocator. The application may even have its own memory pool. Each layer thinks the layer below isn't quite right and re-implements it. That stack of overlapping abstractions is both an illustration of software complexity and an inevitable cost of pursuing extreme performance. Knowing what each layer is doing — and why — is what makes the tower navigable.
