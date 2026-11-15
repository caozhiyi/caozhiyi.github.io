---
seoTitle: "AI Writes the Code, So Who Understands It? Code Review, Explainability, and the Illusion of Knowing"
description: "When AI writes ninety percent of the code and machines do most of the reading, who truly understands the code? Reflections on Anthropic's code review practices, the illusion of explanatory depth, and what AI explainers can never tell us."
---

# AI Writes the Code for Us Now — So Who Understands It?

Two years into writing code with AI, I feel less and less sure about the code in my own hands.

It's a little embarrassing to admit. These days, when something throws an error, my first instinct is to copy it and paste it to the AI. In principle I should look first myself, but somewhere along the way that habit quietly disappeared. Its answers are almost always right, and the problem gets solved. Ask it to walk through a module's logic, and it writes it up clearly — you read it through and can't find fault, yet somehow, after reading, a veil still seems to hang between me and the module. With code I once typed out line by line, I roughly knew why each branch did what it did, why each default value was set to exactly that number, without even opening the file. When exactly that sense of knowing disappeared, I couldn't say.

A few days ago I read Anthropic's piece on how the Claude Code team does code review, and realized the problem is widespread. I admire their approach; still, some of the views in it left me uneasy.

## They Handed Code Reading to the Machine

About ninety percent of Claude Code is written by Claude itself. In Anthropic's main repository, changes merged per day grew from roughly 2,500 in May to more than 30,000 in September. At that volume, reading diffs line by line is no longer humanly possible. Their answer is to hand most of the reading to machines: before a PR is opened, an agent runs the tests, build, and lint on its own; then a second agent, with a clean context, reviews the diff. The PR then goes through CI, AI review, and security review — it cannot merge until review comments are resolved. Then, based on the change's risk, a rule decides how many approvals it needs: low-risk ones may need none, high-risk ones need two. After merging there are still toggles — released to internal employees first, then rolled out in batches — so a problem can be rolled back quickly.

The result: PRs merged from June through September more than doubled, while the share needing rollback actually dropped by over forty percent. The numbers are self-reported, so they deserve a discount. But even halved, they're impressive.

There's one point I readily agree with: whether a human has read the code tells you little. What review really has to solve is where a change might go wrong, and which layer of checking should catch it. Every layer leaks; stacked together, leakage becomes rare; whatever still slips through, rollback cleans up. Purely as quality control, this is entirely sound. With tens of thousands of changes a day, insisting on line-by-line human review is both impossible and unnecessary.

What caught my attention was the article's other thread. It opens by saying code review serves two purposes: one, catching and fixing problems before release; the other, keeping everyone on the team familiar with the code. The first got thousands of words; the second got a short section near the very end, whose first sentence is:

> We don't have a formal process for this.

A startlingly candid admission. Their approach: when you want to understand some part, have Claude write an explainer for exactly that part. There's no perfect word for it, so I'll just call it an explainer. One takes only minutes to produce, and it describes the code as it stands today. They find reading an explainer for a module you're about to touch far more useful than line-reading a diff that only changed one line of copy. They add that no one on the team can hold all of Claude Code in their head, and there's no need to.

I read that last sentence over and over. No one ever held a larger system in their head — true enough. What gave me pause was the half it left unsaid: fine, the whole system doesn't fit, but someone still has to know what the key constraints are, why things were decided the way they were, where things have gone wrong. The understanding I care about is exactly that — not remembering what every branch does. How much of that kind of understanding an explainer can give me, I honestly can't say yet.

## What Is That Veil, Exactly

Sometimes I suspect I'm just being nostalgic. Perhaps I never knew the code that well, and looking back now has gilded it. I haven't entirely ruled that out.

But psychology has a concept for this: the illusion of explanatory depth. In 2002, Rozenblit and Keil ran a series of experiments. They first asked people to rate how well they understood things like zippers and flush toilets; most rated themselves fairly high. Then they asked them to write out, step by step, how those things actually work — and after writing, the scores dropped markedly. The more familiar something is, the more easily we believe we understand it; only when forced to explain it step by step do we discover we overestimated ourselves.

AI explainers make falling into this trap especially easy. They read fluently, clearly organized; you follow every step as you go, and before you know it, you feel you understand. But that understanding usually only reaches the level of recognition: next time you see it, you recall the gist; try to explain it yourself, or push it further, and you mostly stall.

Understanding a piece of code used to be far clumsier. You'd stare at what you couldn't parse, guess at an explanation, follow it to verify, find the guess wrong, and go back to reading. A few rounds of that, and it finally clicked. Hardly pleasant — I don't miss it at all — but code understood that way truly sticks. Explainers spare you all that thrashing; they read easily, and what stays in your head is somehow less. That veil, most likely, is where it came from. Of course, nostalgia and illusion may both be at work.

## What the Explainer Leaves Out

An AI-generated explainer works mostly from the code, so it starts out missing one thing: why the code looks the way it does.

Anthropic says explainers describe the code as it is today. That's their strength — always current, never going stale the way documentation does. But the code retains only the final form that was settled on. Why the alternative design was rejected, which incident later prompted this guard clause, which seemingly redundant check actually plugs a rarely-hit edge case — none of that is in the code, and no amount of careful reading by AI recovers it.

A lot of this context used to pass down through review. A reviewer asks in a comment why it isn't written the other way; the author explains the pitfall they once fell into. A reviewer warns that this pattern caused an incident last time; the author changes it. Once the reason is spoken, one more person knows. Some of it stays in the comments; some is only said in person or over chat, and never recorded.

Such discussions still happen — only the participants have changed. The article mentions a PR where, overnight, one agent reviewed and another revised, back and forth for fifty-some rounds, until the author called it off. The trade-offs, corrections, and rejected approaches across those fifty rounds all happened between agents, with nobody watching. The reasons now sit buried in the logs, and most likely no one will ever dig them out.

On-demand explainers carry another premise: that you know what to ask. The article's example is *How does Claude Code retrieve managed settings?* To ask that, you first have to know that managed settings exist, and that your current problem involves them. When implementing a feature, you usually know which part you'll touch, so looking things up on demand is enough. An incident is different: the symptom sits in front of you, the cause could be anywhere, and often you don't know where to start asking.

Explainers themselves err — inverting a branch condition, misstating when a cache invalidates. To catch that, you must already understand the code; and what the explainer promises to save you is precisely that understanding.

## Two Ready Objections

At this point someone will invoke the compiler: abstraction has always moved up, layer by layer; nobody reads assembly anymore, and nobody feels they've lost control of their programs. The analogy comes up often, but it doesn't survive scrutiny. A compiler is deterministic — the same input always yields the same output — validated for decades by countless programs; problems from below almost never leak upward. AI-generated code is different: the prompt has not become the new source code; what must run, be debugged, and be maintained is still the code. When something breaks, you still have to open the code and read it, change it yourself, chase down the call stack. The writing of code, AI has spared us; the reading, for now, it has not.

The other objection is harder to answer: understanding code need not extend to every line. The engineer knows the interface contracts, how state flows, the concurrency model, how failures are contained; the agent lays down the concrete code, which perhaps need not all live in anyone's head. On this I largely agree — the understanding I meant was never about memorizing every branch. But whether architectural understanding of that kind can be accumulated without ever touching the implementation — that, I doubt.

## The System, Too, Seems to Depend on People Who Understand Code

Rereading the article, a few details caught my eye.

They collect PRs that caused incidents or were rolled back into an eval set, used daily to test the AI reviewer. Whenever the AI review's prompts, tools, or model change, it's re-scored on those cases. A well-made loop — with one unassuming step inside: each case must be confirmed by engineers who know that code, establishing what the bug was and where it lives.

They ask humans to look at test output, commands run, screenshots, and the questions the AI review raised — and they make a point of one line: *If you can't say what the checks would miss, ask for a real review.* To be able to say what the checks would miss, you must first understand the code.

Agents write code so fast that some PRs should never have existed at all. Their remedy: teams work in public channels, and someone who happens to see it will ask why it's being done, or point out that this was already decided differently before. Seeing that, the author either closes the PR or changes direction. But the people who can give that nudge must already know the history.

And there's REVIEW.md, written by code owners, spelling out what counts as broken in this repository. Only people who understand that code can write it clearly.

Laid side by side, the key steps of this system all rest on people who understand the code. That's my reading — the article itself doesn't say so. Their understanding was mostly accumulated the old way: reading code line by line, being reviewed, handling incidents themselves. For now those people are all still around, the system runs well, and the numbers look good. Where the next cohort of such people comes from, the article never addresses.

## A Few Clumsy Methods

What follows are a few of my own practices. Not necessarily right, and useful only at the individual level; they don't solve the team-level problem.

First, be clear about which code must live in your own head. Core paths, key decisions, logic that has caused incidents — whoever owns them should be able to sketch them without AI's help. The rest can be left to AI explainers; I see nothing wrong with that. Holding all of it in your head is impossible at today's pace anyway.

Second, before reading the AI's explainer, explain it to yourself first. Stumbling through it is fine — where you stall is exactly what you don't understand. Read the explainer with those questions in hand, and what you take away will be different. A clumsy method, but it works: whether you truly understand something becomes clear the moment you try to explain it, and the illusion that you already did collapses on its own.

Last, record why things were done this way — something no explainer can give. What the code looks like today, the AI can re-explain anytime; the effort spent on documentation is better spent recording rejected alternatives, past incidents, and the reasons things must not change. The best moment is at merge, written into the commit message or PR description by whoever made the change. Those rounds the agent thrashed through can also be summarized by the agent itself — the trade-offs — with a human checking them over. Anthropic's REVIEW.md records what counts as broken — a standard, not the reasons — but the direction is similar; the article just never ties it to knowledge transfer.

## What Rollback Rates Don't Show

The article closes by saying their goals have never changed: less human effort per change, and no more rollbacks than before. On both metrics, they've done well.

Even if the people who understand the code are slowly dwindling, the rollback and incident rates won't show it — not yet, anyway. As for that second purpose, the one that never made it into the process, Anthropic says it has no formal answer. Honestly, neither do I.

---

Over these two years I've gathered my understanding of AI coding into an open-source book, *First Principles of AI Coding*. It covers, in far more depth, how these models generate code, the role of context and judgment, and how to work with such a machine on real engineering work.

[*First Principles of AI Coding* — GitHub repository](https://github.com/caozhiyi/ai-programming-book)
