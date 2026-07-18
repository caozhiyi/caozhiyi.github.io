# How Large Models Actually "Think"

You hand the AI a piece of code. Seconds later, it comes back with a refactor. The functions are reasonably split, the naming is consistent, and even error handling has been quietly filled in. The whole thing took maybe a few seconds.

What actually happened in there?

Most people would answer something vague: "it understood my code." That isn't exactly wrong, but it's dangerous. The word "understand" smuggles in a human-shaped picture of cognition — read, think, judge, output. What a large model is doing is fundamentally different from that.

> **The core distinction:**
> A large model isn't "understanding" your code. It's doing something more precise, and more limited: **given all the text you fed it, predicting the next token most likely to come next.**

This isn't an academic distinction. It directly determines whether your expectations of AI coding tools are reasonable. Why does it sometimes produce stunning code, and sometimes flunk basic stuff? Why can it refactor a complex function but get a simple multiplication wrong? Why does asking it to "think step by step" measurably improve accuracy? All these things share the same root cause: **probabilistic generation**.

What this article wants to do is take that mechanism apart and show you the pieces. Not to turn you into an ML researcher, but to give you the right intuition: **a large model's "thinking" is nothing like yours — its core operation is probabilistic prediction.** This may simply be how silicon-based brains think — different ability shape, different ability boundary from the carbon-based brain in your head.

---

## What the Model Sees Isn't Your Code

Let's start with the most basic question: when you send a piece of code to the model, what does it actually "see"?

You write `response.status_code` and you see an attribute access expression — the status code attribute on an HTTP response object. Your brain has already done lexing, parsing, and semantic analysis: `response` is an object, `.` is the attribute access operator, `status_code` is an integer attribute, possibly 200, 404, or 500.

The model sees none of that. It sees a sequence of **tokens**.

A token is the smallest unit a large model uses to process text. Before your code reaches the model, a component called the **tokenizer** chops your text into tokens. The chopping isn't done by character or by word — it's done by a statistically learned set of rules.

That same line, `response.status_code`, can end up tokenized completely differently depending on the model:

* **Model A** might split it into `response`, `.`, `status`, `_code` — four tokens.
* **Model B** might end up with `response`, `.status`, `_code` — three tokens.
* **Model C** might treat `status_code` as a single token, because that combination shows up frequently enough in its training data.

The mechanism behind this is **BPE** (Byte Pair Encoding). The idea is simple: whatever character combinations appear most often in the training data get merged into single tokens. `the` is everywhere in English, so it's almost always one token. `status_code` shows up plenty in code, so a model trained heavily on code may treat it as one token. A rare variable name like `myObscureVar`, on the other hand, may be shattered into pieces.

What does this actually mean?

1. **The same code looks different to different models.**
   Tokenization quality directly shapes how easily the model can "understand" code. If `status_code` is split into `stat`, `us`, `_`, `code` — four fragments — the model has to do extra work via attention to glue those fragments back into a single concept. If it's already one token, the model treats it as a single unit from the start. The first case is harder by construction.
2. **Token count directly drives cost and capacity.**
   Model APIs charge per token. The same code may be 100 tokens in one model and 150 in another. That's not just a 50% cost difference — context windows are also measured in tokens, so worse tokenization means less effective information fits into the same window.
3. **The split between code and natural language tokenization decides how good a "code model" is.**
   A tokenizer trained heavily on code learns the high-frequency patterns — `def `, `return `, `self.`, `if __name__` — and encodes them efficiently. A tokenizer trained mostly on natural language can shred those same patterns into noise.

> **Foundational takeaway:**
> It's all tokens. Not characters, not syntax trees, not abstract semantics — a sequence of tokens carved out by statistical learning.

---

## Attention: Not Reading Word by Word, but Linking All Tokens at Once

After tokenization, the model has a sequence of tokens in front of it. The next thing it has to do is **figure out the relationships among them**.

Before large models, the dominant way of handling sequence data was the **RNN** (recurrent neural network). RNNs work a lot like reading word by word: start at the first word, walk forward, update a "memory state" with each new word. By the time you reach token 100, your memory of token 1 is already pretty fuzzy — information decays as it propagates, like a game of telephone where the last person hears something completely different from the original.

This has a fatal flaw: **it can't see far.** If a function's return value is defined on line 10 and used on line 200, by the time the RNN gets to line 200, almost nothing about line 10 is left. For code, that's unacceptable. Code is full of long-range dependencies — variable definition and use, function declaration and call, type definition and instantiation, sometimes spanning hundreds of lines.

In 2017, a paper called *"Attention Is All You Need"* proposed a new mechanism: **attention**. The breakthrough is this: **every token can simultaneously "see" every other token in the sequence, and assign each of them a different "attention weight."**

Imagine reading this:

```python
result = process_data(input_list)
# ... a hundred lines of unrelated code ...
return result
```

When the model gets to `return result`, attention lets it look at every previous token at once. But it isn't treating them all equally — it puts heavier weight on `result = process_data(input_list)`, because that line defines the value of `result` and is directly relevant to the current `return result`. The hundred lines in between are visible, but they get very little weight.

> **The essence of attention:**
> Don't look at everything equally. Selectively focus on what matters.

The clever twist is that large models actually use **multi-head attention**. "Multi-head" means the model runs several attention computations in parallel, each one focusing on a different dimension of the relationships:

* **Head A (syntactic structure):** what kind of token usually follows `return` — a variable, an expression?
* **Head B (variable references):** where has the name `result` appeared earlier?
* **Head C (control flow):** which branch is this `return` inside? Do all paths return a value?

Different heads pick up different kinds of links, and they all get combined into the model's "view" of the code.

Attention has one expensive property, though: **its compute cost is O(n²)**, where n is the number of tokens in the sequence. Every token computes attention against every other token. Double the tokens, quadruple the compute. That's why context windows have a ceiling — not because storage is the bottleneck, but because compute is.

---

## Autoregressive Generation: One Token at a Time, Out the Door

Now the model has "understood" what you gave it. Time to generate a response.

Here's a perception you need to install: **a large model doesn't "think it through and then say it." It emits one token at a time.**

This is called **autoregressive generation**, and the logic is almost embarrassingly simple:

1. The model receives your input — a sequence of tokens.
2. It predicts "what's the most likely next token?"
3. It appends that token to the input sequence.
4. Based on the updated sequence, it predicts the next token again.
5. Repeat until the model emits an "end" marker, or hits a length cap.

At every step, the model is doing exactly one thing: predicting a probability distribution over the next token.

$$P(\text{next token} \mid \text{all preceding tokens})$$

The mechanism is elegantly simple, and the consequences are far-reaching:

* **Why does it sometimes drift mid-output?**
  Because every step's small inaccuracy compounds. Suppose at token 50 the model makes a slightly off prediction. From token 51 onward, every subsequent prediction sits on that slightly-off premise. By token 100, the cumulative drift may have already steered the code off course. Like drawing a long straight line by hand: a tiny angular error at every millimeter, and after a while you're off by centimeters.
* **Why can't it "go back and rewrite"?**
  Because autoregression is one-directional. Generated tokens become the context for generating the next ones. Once a token is out, it's set in stone, and everything after is built on top of it. The model doesn't write a chunk, look back, and decide whether to rewrite — that mechanism doesn't exist.
* **Then why does asking it to "think step by step" improve accuracy?**
  This is the principle behind **chain-of-thought**. Normally, the model has to leap from question to answer in one go, with all the intermediate reasoning happening *implicitly* via attention. But if you make it write out the reasoning steps first, each step becomes part of the context for the next step. It's basically the model handing itself a scratchpad — instead of doing all the reasoning inside one forward pass, it can write down intermediate conclusions and reason on top of them.

From chain-of-thought to dedicated reasoning models (Claude's extended thinking, OpenAI's o-series), the underlying picture stays the same: tokens out, one at a time, in one direction. The "self-correction" you sometimes see is the same trick — the model may write "approach A doesn't work because... try B" inside its thinking tokens, but it isn't really "going back and editing approach A." The phrase "approach A failed" became part of the context, which then nudged later token choices toward approach B.

> **The autoregressive law:**
> Within an autoregressive frame, you trade more tokens (more reasoning steps) for higher accuracy.

* **Why does the second half of long output usually feel worse than the first half?**
  Two effects stack. First, autoregressive drift — the longer the output, the more drift accumulates. Second, attention decay — even though attention can in principle look at all earlier tokens, in practice tokens further back receive lower weights.

---

## Temperature and Sampling: Why the Same Question Gets Different Answers

If you've used AI coding tools, you've definitely noticed: ask the same question twice, get two different answers.

The secret is this: at every step, the model isn't outputting "one definite token." It's outputting **a probability distribution** — every possible token in the vocabulary has a probability.

To control how much variability and randomness sneaks into generation, large models expose three core dials:

| Parameter | What it controls | Behavior |
| :--- | :--- | :--- |
| **Temperature** | Sharpness of the probability distribution | Low temperature → top token gets near-total probability (deterministic). High temperature → distribution flattens (creative, random, occasionally hallucinatory). |
| **Top-k** | Sample only from the top *k* most probable candidates | E.g., k=50 cuts off everything beyond the top 50. Blunt but effective. |
| **Top-p** (nucleus) | Sample dynamically from the smallest set whose cumulative probability hits *p* | E.g., p=0.9 keeps adding candidates until the cumulative probability reaches 90%, then samples within that set. More flexible. |

These mechanisms together encode one fact: **a large model's output is the product of probabilistic sampling, not deterministic computation.**

This has direct implications for AI coding:

* **Code generation:** typically use low temperature (often 0). Code needs to be deterministic and correct — you don't want the model to suddenly improvise `if err == nil` where it should be `if err != nil`.
* **Brainstorming / design exploration:** higher temperature can help, giving you more variation in algorithms or approaches.

---

## The Shape of the Capability: What It's Genuinely Bad At

Probabilistic prediction shapes what large models are good at — and what they are structurally bad at. There are some things they will not do well:

* **Arithmetic.**
  Ask 23 × 47. It might be right, it might be wrong. When it's right, it isn't because it "calculated" — it's because it has seen enough multiplication problems in training data to learn the pattern of two-digit multiplication. There's no calculator inside, no ALU. The "calculation" is pattern prediction in disguise.
* **Precise counting.**
  "How many lines is this code?" It can't really count. "How many elements in this list?" Possibly wrong. Tokenization is the reason — the model isn't seeing physical "lines" or "items." It's seeing tokens, and there's no clean correspondence between token count and the count of conceptual things.
* **Long-distance logical reasoning.**
  Attention can technically reach distant tokens, but weight decays with distance. A reasoning chain spanning 20 steps has a small error probability at every step, and after 20 steps, the chance of the whole chain being correct is low. This is why decomposing a complex coding task into smaller sub-tasks usually beats letting the model solve it in one shot.
* **Hallucination.**
  Hallucination isn't a bug. **It's an inevitable byproduct of probabilistic prediction.** The mechanism is "pick the most probable next token," not "verify whether this is true." When you ask something the training data doesn't actually contain a clean answer to, the model still produces something — fluent, confident, sometimes completely wrong.

In AI coding, hallucinations show up as: referring to APIs that don't exist, calling functions that don't exist, importing libraries that don't exist.

> **A safety reminder:**
> AI being wrong is a probabilistic event. You skipping verification is what turns it into a deterministic disaster.
