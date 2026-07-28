# Mission: Backoff Jitter

## Why

Zain heard "jitter" in Uncle Bob Martin's ["Morning bathrobe rant: 20X"](https://x.com/unclebobmartin/status/2081334541667410312) (26 Jul 2026) and didn't know the term. The goal is genuine mechanical intuition — being able to hear "add jitter" in a design discussion, a postmortem, or a code review and immediately know what problem it solves, what it costs, and when it buys nothing. No production system needs changing right now; the win is understanding that sticks.

## Success looks like

- Explain, without notes, why exponential backoff *alone* does not break up a thundering herd.
- Say what jitter actually reduces (correlation between clients) versus what people assume it reduces (per-client wait).
- Distinguish full, equal, and decorrelated jitter, and name the trade-off each makes.
- Predict when adding jitter changes nothing, and say why.
- Recognise the same mechanism outside retries — scheduled jobs, cache expiry, polling, cron.

## Constraints

- Interactive micro-worlds are the preferred teaching medium — simulators to drive, not prose to read.
- Lessons must work offline over `file://`; no build step, no CDN.
- Intuition-first. Formulas are welcome but only after the mechanism is felt.

## Out of scope

- Network/packet jitter (VoIP, video, jitter buffers) — different meaning, different topic.
- UI/animation judder.
- Implementing or tuning retry logic in a specific production codebase.

## Revision evidence

- 2026-07-27 — Mission created. Source ambiguity resolved by Zain: the intended sense is
  classic backoff/timing jitter, not the network or agent-variance senses. The linked tweet
  text is only "Morning bathrobe rant: 20X."; the word "jitter" appears in the attached
  66-second video, which could not be retrieved or transcribed.
