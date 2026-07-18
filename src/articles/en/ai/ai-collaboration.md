# Riding the Wave: From Verb Coding to AI Collaboration — One Engineer's Reflection and Reset

Since GPT-4 landed in 2023 and rattled the world, AI has been moving at a pace it's hard to keep up with. As an engineer working on the internet stack, I've been on the receiving end of every aftershock. This isn't some gentle current. It's a tidal wave reshaping the skill tree we've all been climbing.

Look back over these two years and it's been one paradigm shift after another: from awkwardly pasting code into a chat box; to AI-native IDEs like Cursor showing up and letting us *describe* code into existence — the rise of **Verb Coding**; to projects like Open Space starting to circle the harder problem of multi-engineer collaboration and code seriousness, hinting at what we might call **Space-Driven Coding**.

Whether you embrace it or push back, the wave carries you either way. Anxiety and excitement come together; so do confusion and small flashes of clarity. This piece is about my own AI coding experience over the last couple of years — an attempt to find a clean line through the noise, in case any of it is useful to someone else.

---

## I. How Coding Has Changed: From Workshop to Smart Factory

Let's first look back briefly at how coding itself has evolved. Given my age and career, I'm going to skip the punch-card stories and the "writing C++ in Notepad" era. The interesting territory for me is more recent — modern software engineering and how it's been shifting.

### 0. The Old Way: IDE Hints, Human Brain Solves Problems (The Craftsman Era)

Before AI moved in at scale, we were living in a kind of golden age of craftsmanship.

The most "intelligent" thing IDEs like IntelliJ IDEA or VS Code could do back then was static analysis and grammar-driven autocomplete. Type `List.` and a dropdown showed `add`, `remove`, `size`. At the time, that already felt like real convenience.

But the entire reasoning loop happened inside the developer's head. You held the class diagram in your mind, remembered intricate API signatures, and tracked the side effects of every line. When something broke, you played detective on Stack Overflow, sorting useful answers from the noise and reassembling fragments into a working solution.

Programming was a long, lonely intellectual climb. The quality of the code depended on how much caffeine you'd had, how good your memory was, and how cleanly you could think that day. We were the absolute owners of the code — and also the only people on the hook for it.

### 1. First-Generation AI: Paste Code Into a Chat Box (The Chatbot Era)

ChatGPT cut the first opening into the wall.

The defining feature of this era was *context fragmentation*. We started constantly switching between IDE and browser. Copy the error log, paste it into the chat, "help me fix this bug." Or describe a need: "write me a Python quicksort."

It cut down on documentation lookups and Google searches, but it was still essentially a *bolt-on assistant*. The AI didn't understand your project structure. It didn't know what utility classes you'd built. It had no clue about your business logic. The code it produced was generic, textbook-shaped, and you had to do a lot of "localization" and glue work to make it fit.

In this era, we were *couriers*. We carried information back and forth between two worlds: human intent into the AI, AI output back into the codebase. Faster, sure. But the fragmentation always made it feel like AI was just a smarter Google, not a real coding partner.

### 2. Second-Generation AI: AI Embedded in the IDE (The Copilot Era & Verb Coding)

GitHub Copilot, and then Cursor, changed the game.

Once the AI could read the current file's context — and via RAG, even index your whole project — quantity turned into quality. The defining experience of this era is *flow without interruption*.

You don't switch out of the IDE anymore. You write a comment: `// parse the user-uploaded CSV and store it in Redis`, hit Tab, and a ghostly suggestion appears, using the `RedisClient` and `CsvParser` *you* defined in *your* project.

This is the seed of **Verb Coding**. Attention starts moving from *syntax* to *intent*. You describe the verb; the AI fills in the subjects and objects.

Cursor takes this further. `Cmd+K` lets you rewrite a code block in plain language. `@Codebase` lets the AI reason about the whole project. The bar for writing code drops, but the bar for *describing* what you want — prompt engineering — goes up. You learn to describe intent precisely, and to review AI output the way a product manager would.

### 3. Third-Generation AI: AI in the Driver's Seat, Human Assists (The Agentic Era & Space-Driven Coding)

This is the threshold we're crossing right now, and the territory projects like Open Space are trying to map.

If second-generation AI was the copilot, third-generation AI is starting to take the wheel — closer to *autopilot*, with the human moving into the role of driving instructor or safety officer.

In this stage, AI isn't completing one line or one function. It's becoming an **Agent**, with traits like:

- **Planning tasks on its own.** Given something vague like "refactor the payments module," it can decompose that into "define new interfaces," "modify the DB schema," "migrate old data," "update callers," and so on.
- **Working across files at once.** It's no longer trapped inside a single file's perspective. It can change frontend components, backend APIs, and DB migration scripts at the same time, and keep them consistent.
- **Self-correcting.** Run the tests, see them fail, read the stack trace, fix the code, run again, until they pass.

That's the vision behind **Space-Driven Coding**. It tries to go after the multi-engineer collaboration problem — AI joining a team as an independent developer, opening PRs, going through code review, even taking part in discussions. Code "seriousness" gets re-examined, because what AI produces is no longer a casual snippet; it's a real engineering deliverable.

### 4. Beyond? — From Tool to a New Species

Push the timeline a little further and a few large shapes start to emerge from the fog.

- **The AI software factory.** Maybe the future isn't outsourcing teams of hundreds of engineers, but compute centers running tens of thousands of AI agents. You hand over a detailed PRD, pay in tokens, and these tireless digital workers ship a full system — frontend, backend, ops scripts — in minutes. They own the project, deliver around the clock, and cost a tiny fraction of a human team.
- **Infinite context, personal partners.** As context windows push past millions and into billions of tokens, the AI of the future could carry something close to total recall. It remembers every line in your project, that elegant regex you wrote three years ago, your preferred naming style, even which kind of indentation you can't stand. It stops being a generic tool and becomes something closer to a custom-fitted partner — one that arguably understands your coding habits better than you do.
- **AI-native programming languages.** Java and Python are compromises designed so humans can read what the machine is doing. There may eventually be an interaction language built specifically for AI — more precise than natural language, more abstract than assembly. Humans define high-level logical constraints; AI constructs the actual implementation in this dense intermediate language inside its own black box. At that point, the syntax-flavor wars are over, and we move into pure logic construction.

---

## II. Will AI Replace Us? Facing the Anxiety Honestly

"Will AI replace programmers?" is the sword hanging over every engineer's head right now.

My answer: **AI will replace the act of "writing code." It will have a much harder time replacing the act of "creating software."** At least for now and the foreseeable future, AI has a few real Achilles heels.

### 1. No Long-Term Memory, No Tacit Knowledge

No matter how big the context window gets, today's models still lack a project's *long-term memory* and *tacit knowledge*.

A system that's been running for three years is full of compromises and historical baggage:

- Why is there a seemingly pointless `sleep(100)` in this function? Because three years ago, the third-party banking API we integrated had concurrency limits.
- Why is that database column called `status_v2`? Because the original `status` column was locked down by the legacy finance system.

This kind of knowledge often isn't in code comments. It isn't in the Git log. It lives in the heads of senior engineers, in DingTalk and WeCom message threads, in postmortems written after each production incident. The AI sees `sleep(100)` and may "helpfully" optimize it away — and take down the line. **AI lacks deep understanding of how a business has actually evolved.**

### 2. AI Cannot Be Accountable: Authority Without Liability

This is the deepest ethical and practical problem. **AI cannot take the blame.**

When AI-written code causes a multi-million-dollar loss or leaks user data, who do we hold accountable? Can we put AI on trial? Can we fire it? No. The person who signed off on the release has to be a human.

Software engineering isn't just writing code that runs. It's owning the outcome of what you ship. During a P0 incident, AI can suggest investigation paths, but it can't sit at 3 AM under massive pressure and make the call between "roll back" and "patch in place." That call is, ironically, the single biggest reason AI hasn't replaced humans yet — both fortunate and a little unfortunate, depending on the night.

### 3. Can Anyone Code With AI? — The Literacy vs. Authorship Paradox

There's a popular line going around: "With AI, everyone is a programmer." That's not just wrong, it underestimates how serious engineering actually is.

**You need to be literate to write a good essay, but being literate doesn't make you a good writer.** Same logic. AI gives everyone the *generation* of code (literacy). It does not give everyone the *construction* of systems (authorship).

Programming, especially in real production environments, is a long-term, serious activity. It's about stability, maintainability, security, and the ability to grow. Someone with no engineering training can probably get a demo running on AI-generated code. Drop the same person into high concurrency, data consistency, microservice governance — and the AI-stitched code can collapse into a disaster overnight.

**The value of an engineer is shifting upward, from "writing code" to "judging and ruling on code."** Only someone who really understands the principles can tell whether AI's output is treasure or trash, and pull the system back when AI hallucinates at the wrong moment.

---

## III. Our Relationship With AI: Use the World, Don't Compete With It

There's an old line from Xunzi, in *Encouraging Learning*: "The exemplary person is not different at birth; they are simply skilled at making use of the world around them."

That line lands hard in the AI era. Our relationship with AI shouldn't be adversarial. It should be one of *steering and collaboration*.

### 1. Have AI Do the Work, Not the Thinking

It's easy to fall into the trap of treating AI as a wishing well. Drop in a vague request, close your eyes, wait for output. That's the most dangerous mode.

**AI should be your exoskeleton, not your brain.**

- **Hand off the repetitive.** Unit tests, CRUD endpoints, regular expressions, doc comments.
- **Keep the thinking yourself.** System architecture, the core business logic, the tricky edge cases.

When you're no longer trapped in syntax minutiae, you should feel relieved — you've finally bought yourself the time to think about the deeper logic underneath the code. You're moving from bricklayer to architect.

### 2. Treat It as a Partner, Not a Competitor

I prefer to think of AI as a **knowledgeable but somewhat clueless, hardworking but never opinionated, pair programmer**.

You're the captain. AI is the first mate. You read the chart (architecture). You read the weather (the business environment). You give clear orders (prompts). The first mate works the rigging, adjusts the heading, calculates the supplies.

---

## Closing

The wheels of technology grind forward. They crush old habits without sentiment, but they also generously pave the road toward the stars.

Maybe one day we really will be replaced, and become the leftovers of a previous era. *But anyway*, as engineers, we are extraordinarily lucky. We're watching, in real time, the largest intellectual revolution in human history. We're standing at the crest of the wave, watching silicon-based intelligence go from stumbling toddler to full sprint.

Will the future be a tech utopia where everyone is well-fed and freed from drudgery, or a neon-lit cyberpunk world of high tech and low life? Nobody knows. But what matters is that we are *here*. Not just spectators — participants and accelerants of this wave.

The singularity will come. **Witness is happiness.**

Even if the curtain eventually falls, having shared a dance with the gods on this stage will already be the great romance of one's life. May we all stay clear-headed and stay curious in the AI tide, and walk into a future that is unknowable but endlessly captivating.
