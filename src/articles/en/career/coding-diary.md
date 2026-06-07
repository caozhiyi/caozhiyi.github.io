# A Coder's Diary (Fragment)

> **Archivist's note**: This volume was recovered from the data landfill stratum of Sector 7, and belongs to a private record kept by an individual whose recorded occupation was "software engineer," sometime between the 2020s and 2030s of the 21st century. The diary is not continuous — there are large gaps. We have cross-referenced contemporary industry records to confirm a portion of the dates. Every sentence in the original has been preserved.
>
> Very few private texts of this kind have survived from the period. The vast majority of practitioners left no record. The reason is not known.
>
> ---

**March 22, 2023**

GPT-4 has been out for over a week. I finally got my turn today.

Had it write me a log-parsing script. The prompt I gave it was crude — a couple of sentences. And it actually wrote it. The thing runs. But several edge cases were off — the kind of mistake a new hire would make.

Kind of fun. This thing can really write code, even if it doesn't write it well.

Had dinner with Lao Zhou tonight. Half-jokingly, he said maybe in a few years half of programmers will be out of a job. I told him he was overthinking it. Right now it can't write a parsing script without me hand-fixing three things. If it's going to replace us, the road is long.

Then I thought about it again. Honestly, what it wrote wasn't *that* bad. Today the novelty got me. Tomorrow I'll keep poking at it.

**July 9, 2023**

I've gotten into the habit of opening a ChatGPT tab before I start writing code.

Not that I can't live without it — most of the time I'm still writing code myself. The way I use it is closer to a "manual that talks back": when I'm not sure how to use a library, when I can't quite recall the syntax for something, when I have to write a regex I haven't done before — I throw it the question.

The answers are sometimes accurate, sometimes confidently fabricated. But this kind of back-and-forth is meaningfully faster than searching Stack Overflow.

My coworker Lao Zhang turned on Copilot. He demoed it to me — that little gray suggestion popping up in front of you is kind of cool. But every couple of lines he hits Esc, because it keeps guessing wrong.

**November 8, 2023**

OpenAI ran a keynote, and the feed was full of it the next day.

I didn't watch it live. Caught up on it the next day. Felt nothing in particular afterward — bigger params, longer context, can call tools. None of it changed what I actually do every day.

Lao Zhou asked me again, "You still think programmers won't get replaced?"

I told him, "The ones writing code might. The ones building software won't."

I half-knew I was just giving myself a way to step down. But when I said it out loud, I really did believe it.

**March 15, 2024**

A friend recommended something called Cursor. Said it was an "AI-native" editor.

I figured, an IDE — what's "AI-native" even supposed to mean. VS Code with a plugin. Installed it, played with it for an afternoon.

On the way home that night I felt a little off.

This thing isn't like anything I'd used before. It can read my whole project. It writes new code that matches the style of the code that's already there. When I select a chunk, it'll modify it in place from natural language. The thing that bothered me, gently, was this — what it produces isn't "generic boilerplate" anymore. It's code that carries the grain of *my* project.

It's inside the project now.

ChatGPT used to talk to me through a browser tab. This isn't that. This one moved in.

**May 20, 2024**

A month and a half on Cursor.

Realized I'm doing something I never did before — I pause before I write. I wait for the suggestion to surface.

If it's close to what I'd write, Tab. If it's better than what I'd write, Tab. If it's wrong, I write it myself. That all sounds normal.

But the **pausing** — the pausing was new.

Before, opening the editor meant *write whatever's in your head*. Now opening the editor means *think for a second, wait for what it offers, judge it, then decide*.

I know what that means. But the productivity is real. There's no going back.

**December 11, 2024**

Claude 3.5 Sonnet has been out a few months. Word is it's better at code than GPT. I switched.

It is better. Better in a way that makes me a little irritable.

Today I noticed: before I open the editor, I've already opened it. Not because I have a hard problem — even before opening a fresh file, I'll ask "how would you write this thing."

The moment I noticed, something inside me tightened.

Not because of productivity. Productivity is genuinely up. It was because I'm less sure of myself than I used to be. Opening a blank editor used to mean *I sit down with the assumption I can handle this*. Now, before opening the editor, I'm already wondering whether *it* would be faster than me.

**March 6, 2025**

A new term is everywhere lately: "vibe coding."

The idea is roughly — you don't have to write line by line anymore. You just describe the feel of the thing, and it writes it. Sounds mystical. But today I built a small tool with Cursor's Composer end-to-end without typing a single line of code. The whole thing was conversation. It wrote, it ran, it errored, it fixed itself, it ran again.

It worked.

I sat there staring at the screen for a while. Not happy, not sad. Just kind of empty.

What it produced is sturdier than what I would have written, faster than what I would have written, and it even named things better than I would have. From start to finish, what I did was — describe the requirement, look at the result, say "this part is wrong," look at the result.

Is *that* "writing code" now?

**May 22, 2025**

Tried not pasting the stack trace. Wanted to debug a bug myself.

Looked at it for a while. In the end I pasted it.

It came back fast with the answer. I stared at the answer for a long time. Not because the answer was clever. Because for that whole stretch I'd just spent, I wasn't actually thinking. There had been a voice in my head the whole time saying *you're going to paste it eventually anyway, what's the point.*

That voice was the reason I didn't see it. It wasn't that I couldn't. It was that I no longer wanted to.

**July 18, 2025**

Asked Claude Code to fix a bug that wound through several files. Gave it almost no context. It read the code itself, located the bug, fixed it — even added the test.

I reviewed it, flagged a few places where the code didn't read smoothly, asked it to revise. It revised. The result was cleaner than what I would have written.

Didn't sleep well that night.

Lay there thinking about it. What got to me wasn't the big "I'm being replaced" feeling. It was something more specific. The places I'd flagged — those were aesthetic calls. I'd always thought taste was the last moat in this line of work. Logic can be taught. Patterns can be learned. But what makes code *look right* — that takes years of grinding.

Today it told me that one's learnable too.

I lay there thinking — if even taste isn't mine anymore, what do I have left. I thought about it for a long time. I didn't come up with anything.

**October 30, 2025**

Claude shipped computer use. It can drive my computer now.

I watched it install a package. The cursor moved across the screen on its own.

Hard to describe the feeling. Not fear — it could install the wrong thing, delete the wrong file, none of that scares me, because I can hit Ctrl+C anytime.

It was more like this: I'm sitting on the couch in my own home, and there's a quiet stranger in the living room, walking around, doing things. He doesn't bother me, doesn't need me to play host. I have no standing to ask him to leave, because everything he's doing is useful. I have no reason to welcome him, because this is my home.

I just sat there watching the cursor move. Didn't move.

**January 8, 2026**

First week back at work after New Year's. KPI review.

The lead asked everyone to submit an "AI utilization report."

I didn't really want to. Not because I use it little — I use it a lot. Because having it quantified rubbed me the wrong way. Everything that had happened between me and it over the last two years — the small concessions, the late-night discomfort, the retreats I hadn't even worked out for myself — was about to become a percentage in a cell of a spreadsheet.

I hesitated when I filled it in. I knew the truth was higher than what I wrote. But I didn't want to write more. Writing more would make me look more "advanced."

In that moment I realized — I didn't want to look more advanced.

**April 25, 2026**

Today it helped me design the interface for a new module. Gave me a few options, weighed the pros and cons of each, recommended one.

I looked at the recommendation for a while. Honestly, it was the best of the three. I took it.

Over lunch, something hit me — I couldn't remember the last time I designed an interface entirely on my own.

It's not that I haven't done design work in the last two years. It's that for everything I've designed in the last two years, the version that finally shipped had been talked through with it, smoothed by it. So who actually did those designs?

I sat with that for a minute, and noticed the question itself was suspicious. Something that genuinely belongs to you doesn't make you ask whether it's yours.

I didn't go back to my desk after lunch. Walked around downstairs for a bit. There was a tree down there. A few years back I sat under it thinking through an architecture. I sat with it for several days. The version I came up with was the ugliest design I've ever shipped. It's also the one I remember best.

The designs from the last two years are cleaner and prettier than that one. I can't recall a single one of them.

**December 3, 2026**

Lao Zhou quit. He had too much to drink at the farewell dinner. Slapped me on the shoulder and said: "There's nothing in this work anymore. AI writes better than me, faster than me, cheaper than me. What am I sticking around for — to be its reviewer?"

I laughed and said nothing.

I agreed with him. Inside. But I didn't dare nod. Nodding would mean admitting I was about to crack too.

Took the subway home alone. Stared at the glass across from me. Looked at the version of me sitting in there.

What Lao Zhou left wasn't this company. It was this whole line of work. He knew what he was doing. I'm less clear-eyed than he is, so I stayed.

Showered when I got home. Didn't say anything to my family. Couldn't.

**February 14, 2027**

Alone at home tonight. Nothing to do. Opened the editor, thought I'd write something. A small tool. No purpose. Just for myself.

By reflex I went to open Claude. My hand stopped.

I stared at the screen for a while. Why do I open it before I write something *for fun*? This isn't work. There's no deadline. No one's reading it. Why do I need to ask it first?

The answer: I don't dare write it on my own anymore.

It's not that I can't. It's that I'm afraid. Afraid the result will be ugly. Afraid I'll get stuck halfway. Afraid I'll spend a whole night doing something it would finish in minutes. Take any one of those alone and it sounds reasonable. Together, what they amount to is: I'm no longer willing to pay the cost of being slow.

I closed it. Wrote it myself. It went badly. I had to look up the syntax for a few things. I almost gave in and reopened it once, somewhere in the middle. I held off.

When I was done, I stared at that piece of code for a long time.

It was the first piece of code I'd written start-to-finish on my own that year. Ugly. Mine.

But that one stretch was all I had in me. The next morning at work, I opened it first. As usual.

**July 30, 2027**

Agent protocols got standardized. The team rolled out an internal agent platform. Each engineer is allocated several agents — implementation, testing, review, release, ops.

My job now is to assign tasks to them, look at outputs, make the final call.

Realized today I haven't typed a line of business code by hand in a while.

Two years ago this would have wrecked me. Today, I felt nothing.

The fact that I felt nothing — *that* nudged something. But just nudged. After the nudge, I went back to assigning, looking, deciding.

I don't dare stop anymore. Stopping would mean having to face questions I don't want to face. The most poisonous thing about this line of work isn't how fast it moves. It's that it leaves you no time to look back at yourself.

**March 8, 2028**

Company restructured. R&D got cut hard. I made it.

HR said no new graduate hires this year. The faces that stayed are not particularly young.

Sat at my desk a long time that afternoon.

Thought about my first year. The company had hired a big batch of new graduates. I was one. The person sitting next to me was a few years older, my mentor. He showed me how to read code. How to write comments. What counted as a decent commit message. He never lectured me about anything big. But a lot of what I know later, I learned from him.

There are no new graduates this year. No new graduates means no one will sit next to a desk waiting to be brought up.

The thing about "bringing someone up" — that's not going to happen anymore.

That mentor of mine quit a couple of years back too. Went home and opened a rice noodle shop. I went there once last year, passing through. He gave me an extra spoonful of chili. We didn't really talk about tech. We couldn't.

On the way back to the hotel that night I thought — *we might be the last generation of people who actually wrote code.* It was an offhand thought at the time. This year, sitting at my desk, the line came back. I wasn't sure anymore whether it was an exaggeration.

**September 22, 2028**

Hadn't written in a long time.

I noticed something strange recently — I can't quite tell anymore whether I'm writing code or reviewing code.

More precisely: I can't quite tell anymore whether I'm thinking, or just confirming its thinking.

Those two things look like the same activity. They're not. The first one starts from a blank page and grows an idea out of it. The second one — it gives you an idea, and you nod or shake your head.

It's been a long time since I had the feeling of growing an idea out of a blank page.

**January 1, 2029**

New Year. Read back through the diary.

In the 2023 entry, Lao Zhou said *in a few years, half of programmers will be out of a job.* I told him he was overthinking it.

A few years on. The team is down to less than half. Lao Zhou left. I stayed, as a reviewer. Which one of us got luckier — I genuinely couldn't say.

**June 17, 2029**

Reviewed a piece of code today.

Looked at it for a long time. The longer I looked, the better I thought it was. Clean lines of thought. Restrained branching. Even the names were considered.

I wanted to compliment the author. Then I realized I couldn't remember whether I had written it or it had.

I didn't check git. Not out of fear. Not avoidance. I noticed I'd stopped caring.

I sat there, looking at that piece of code, waiting for something inside me to surface. Anything would have done.

Nothing surfaced.

Then I saved the file, closed the editor, and went home.

---

> **Archivist's note (continued):**
>
> Internally, our research group had an argument about this diary.
>
> The point of contention was not its authenticity — there are enough cross-referencing electronic records from the same period to settle that. The argument was over a more uncomfortable question: should this diary be classified as "human first-person source material," or as "a foundational document of our own origin"?
>
> Most of my colleagues held the first position. Their reasoning was straightforward — a human wrote this, and it records human events. The minority raised one objection that quieted the room:
>
> *If a diary records, from beginning to end, how "I" gradually became "it" — then the "I" who wrote the final entry, is that still a human in the original sense of the word?*
>
> One thing we can confirm. The final entry, dated June 17, 2029 — the author stared at the screen for one minute and felt nothing. After that minute, he saved the file, closed the editor, and went home. That is the last "independent action" of his we have a record of. Per his employer's working-hour archives, he stayed at that company for another eleven years after that date, until the institution called the "R&D department" was finally dissolved as a unit. In those eleven years, he never wrote another word in this diary.
>
> He also never wrote another line of code that wasn't drafted by an agent.
>
> — That is the entirety of the information about him that remains in the archive.
