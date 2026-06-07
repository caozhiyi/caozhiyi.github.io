# How to Keep Software From Rotting

Looking back, it's been almost eight years since I graduated. Across that span I've worked at a few places — some were the household-name BAT giants, some were just-IPO'd startups. I've touched a fair number of projects along the way, and the honest summary is this: **most of what I've seen was a debt-laden pile, structurally sound projects were the rare exception.** I've been quietly chewing on the same question for years — *why does code drift, almost inevitably, toward rot?* I'm sure every project starts out with serious thought and effort poured into it. And yet, given enough time, most of them collapse into something nobody enjoys touching.

There are non-technical reasons for this — schedule pressure, cross-team coordination, attrition. I'll set those aside. From a purely engineering angle: **is there a way to slow the decay?**

---

## Why Rot Is (Almost) Inevitable

Imagine a project that ships its initial feature set and then never changes again. That project will not rot. Even if the original design wasn't great, the technical debt baked in won't grow. But anyone who's actually shipped software knows this scenario doesn't exist. The whole reason it's called "soft"-ware is that it's expected to change. Products iterate, requirements iterate, technology iterates. Every piece of software ends up changing — willingly or not. **Iteration means stacking new branches of logic onto a structure that's already shipped.**

Requirements aren't predictable. So you sometimes find yourself building a ten-story building on a foundation poured for two. That mismatch is the root cause of software rot. The architecture you sketched out at the start, the domain model you abstracted on day one — neither was designed against requirements that didn't exist yet. Schedule pressure makes a real refactor impossible, so you compromise, you patch the gap, you leave a note for future-you. Multiply that across dozens of iterations, season with a few rounds of team turnover, and eventually the project's institutional memory thins out to a point where nobody can fully explain why things look the way they do. From there, you've got two choices. Patch the bloat with more patches. Or do the painful, full-blown structural rewrite. Neither is a good time.

Can rot be avoided entirely? My answer: **no.** The root cause — change — isn't going anywhere. You cannot foresee every future iteration on day one, which means you cannot eliminate the friction that future requirements will have with your current design. The good news: you can absolutely **slow it down**. Which leads to the next question.

---

## Designing for Change

In *Clean Architecture*, Uncle Bob makes one point that I keep coming back to: **the essence of architectural design is to defer decisions.** Which database to use, which framework, which protocol to talk to other components — all the decisions that get treated as architectural in most rooms — are actually technical details. The real business logic, the so-called **core domain**, should be independent of all of them.

This is the Dependency Inversion Principle, more or less: **higher-level logic should depend on abstractions, not on implementations.** "Abstractions" here, in OOP terms, just means a set of interfaces.

In OOP, an interface describes *what* an object can do. The caller has no need (and no business) knowing *how*. Chen Hao (耗子叔) once put it this way: *you walk into a store, you owe three dollars for a Coke. Do you hand the cashier your wallet and let her dig out three dollars? Or do you take three dollars out and hand it to her?* The answer is obvious. And yet, in software, plenty of code does exactly the wallet-handover version — exposing internal fields, returning internal references, leaving member variables wide open. The point of an interface is to **draw a clean line between the two parties' responsibilities**. Interaction goes through the interface and only the interface, satisfying the Law of Demeter (LOD). Internal implementation details no longer leak. The caller carries less in their head. That's the isolation benefit.

Another benefit of interface-based design: **testability**. If callers only see interfaces, implementations become swappable. I've seen too many teams unable to write unit tests because their code can't actually run unless every dependency is real — the database has to be up, the queue has to be wired, every upstream contract has to be finalized. Only then can they fire a request from the outermost layer and inch through the call chain debugging end-to-end. Decouple via interfaces, and dependencies become trivially **mockable**. Every component can be unit-tested in isolation.

*Microservices Patterns* lays out four levels of testing:

- **Unit tests** — function, class, interface level.
- **Integration tests** — connection-level tests against infrastructure (database, cache, config center, etc.).
- **Component tests** — testing service-to-service interface calls.
- **End-to-end tests** — full business flows starting from the front-end interface.

Top to bottom, the granularity gets coarser, the cost gets higher. Plenty of projects I've worked with had no unit tests, no integration tests — they wrote heads-down until something looked roughly complete, and then started from component tests, hand-crafting requests against the outer interface. Just getting the happy path running could take days. If a structural problem then surfaced, more heads-down rewriting. Of course schedules slip.

**The further your tests are from the code, the more expensive each iteration becomes.** "Distance" here works on two axes: time between writing the code and testing it, and depth of the call stack between the test and the function under test. It's like the old shower analogy — if the temperature knob is far from the showerhead, your adjustments take a long time to show up, so you over-correct, swing too hot, then too cold.

So all of this collapses to one line: **use interfaces to build the skeleton; use implementations to fill in the detail.**

Interfaces themselves come in two flavors:

1. **Inbound interfaces** — capabilities I expose. "I can send over the network." "I can query the database." Whoever calls me, I don't care.
2. **Outbound interfaces** — callbacks I emit. The server got a request, the observer pattern needs to notify subscribers — "I want to notify the outside world; I don't care exactly who."

Build code around these two interface shapes and upstream/downstream coupling drops dramatically, while extension headroom goes up.

---

## How to Keep Engineering Quality Under Control

Another SOLID principle worth dragging in here: **Open/Closed Principle (OCP) — open for extension, closed for modification.** In plain language: iterate by *adding* new classes and new files, not by *editing* old ones. The benefits are obvious:

- Adding without modifying means **the blast radius is bounded**. New features can't silently break old ones.
- New logic isn't tangled into old logic, so testing is easier — you don't have to re-prove backward compatibility from scratch each time.

I've seen plenty of monstrous implementations: one omnipotent class, one function several hundred lines long, sometimes north of a thousand. Logic written as a flat scroll, no encapsulation, no decomposition, basically untestable — covering its branch matrix in tests would require crafting inputs more elaborate than the function itself. **How could code like that not rot?** Every change has to be performed like internal surgery — slipped in carefully so as not to graze any nearby tissue — and naturally, your changes can't be tested either.

And testing is one of the central levers of code quality. *A Philosophy of Software Design* makes the point bluntly: **software development is, fundamentally, a fight against complexity.** Complexity shows up as:

- **Change amplification** — a simple requirement triggers changes in many places.
- **Cognitive load** — the design isn't cohesive or well-decoupled, so to change one piece of code you need to know far too much. Miss any of it and the change goes wrong.
- **Unknown unknowns** — the code doesn't make its knowledge explicit, so you can't even tell what you don't know.

I expected the book to introduce some grand theory or advanced design idiom. It doesn't. It nags. About things you've heard a thousand times: how to write comments, how to name variables, how to make interface semantics unambiguous, how to make encapsulation deep (cohesive and self-contained, with the caller never needing to know what's inside)…

Code quality isn't won by a high-end technique or an elaborate process. **The precondition is that other people can read what you wrote.** The "I just need to read my own code" reply is easy to bat down: organizations restructure, people rotate in and out, your future self has a finite working memory, and "the future reader of this code" is often, well, you. To write code that other people can read, you have to write code from the reader's point of view. **Code is not just instructions for the computer — it's a communication channel between humans.** That mindset shift comes first; the practices follow.

The deeper you go into architectural ideas, the more they start to feel like the old Zen line — "the mountain is once again the mountain; the river is once again the river." The clichés of the industry — comments, naming, SOLID, design patterns — are clichés because they work. Apply them at a basic level and code quality goes up visibly. Internalize them and you don't end up sitting on debt that nobody can move anymore.

---

## A Few Lessons Learned

### How to maintain interface documentation

Interface docs matter — especially for cross-team work, especially in a microservices world. Many teams rely on **process** to keep docs current. Better than nothing. But process always has gaps, and what I see in practice is that interface docs get stale, or never exist at all. People either pass them around verbally, or they go read the source.

My take: **govern interfaces with technology, not with rules about humans.**

- For serialization formats (JSON, Protobuf, XML, etc.), prefer an IDL like **Protobuf** to define interfaces and let tooling generate the implementation. The `.proto` file is the docs. Drift between docs and code stops being a documentation problem and becomes a compile error.
- For HTTP APIs, hew as close as you reasonably can to **RESTful** conventions. Don't invent your own.
