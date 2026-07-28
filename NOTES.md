# Working notes — jitter-test

## Teaching preferences

- Zain asked explicitly for **interactive micro-worlds**. Lead with a simulator the learner
  can drive; prose supports the simulator, not the other way round.
- Intuition-first: mechanism felt before formulas shown.

## Workspace facts

- `jitter-test/` is a plain local directory — **not** a git repo (despite the session's initial
  environment snapshot saying otherwise; `git status` reports "not a git repository"). So the
  shared-repository fetch/commit/push sync rules in WORKSPACE.md do not apply yet. If this
  workspace ever moves into `claude-notes` or another shared checkout, they start applying.
- Delivery mode: `file://`, opened locally. No `HOSTING.md` yet — create one only if
  cross-device access is needed.

## Source-retrieval note (2026-07-27)

The originating tweet, [unclebobmartin/2081334541667410312](https://x.com/unclebobmartin/status/2081334541667410312),
has body text "Morning bathrobe rant: 20X." and a 66-second video. The word "jitter" is spoken in
the video only. x.com returns HTTP 402 to unauthenticated fetchers; fxtwitter/vxtwitter mirrors
returned the text but no transcript; no third-party write-up of this specific rant exists yet.
**Zain resolved the ambiguity by choosing "classic backoff/timing jitter."** If he later watches
the video and Uncle Bob meant something else, MISSION.md needs revising before lesson 2.

## Micro-world calibration (lesson 1)

Defaults were tuned, not guessed. Verified against the engine:

| Strategy | Completion tick | Total calls | Largest retry burst |
| --- | --- | --- | --- |
| No jitter | 760 | 480 | 56 / 60 |
| Full | 30 | 145 | 12 / 60 |
| Equal | 52 | 163 | 20 / 60 |
| Decorrelated | 41 | 120 | 5 / 60 |

`clients=60, capacity=4, base=8, cap=64, seed=7`.

Two calibration lessons worth keeping:

1. **"Peak burst" was a broken metric.** Tick 0 always carries the whole fleet regardless of
   strategy, so overall peak read 60 for all four and showed nothing. Replaced with `peakRetry`
   — the largest load on any tick *after* tick 0. That is the number that actually moves.
2. **base=2 muted the effect.** With small early windows, rounding to integer ticks collapsed
   the spread (full jitter's first retry could only land on tick 1 or 2). base=8 gives jitter
   room to work and makes the contrast legible.

Chart buckets long runs (each column = N ticks) rather than truncating — truncation would have
hidden the no-jitter tail, which is the whole point.

## Verification performed (2026-07-27)

Lesson driven end-to-end in jsdom: initial render, strategy change, Compare-all-four, the
no-contention case, Reset, quiz scoring (right/wrong/unanswered paths), external stylesheet
load, single `h1`, `pre[aria-hidden]`, chart hidden from a11y tree. All passed.

## Open loops

- Lesson 1's chat quiz issued 2026-07-27 — **not yet answered**. No learning record until it is.
- Lesson 2 planned: full vs equal vs decorrelated, and the cost side (individual tail latency
  traded for fleet smoothing). RESOURCES.md flags that no good source for the cost side exists yet.
- Lesson 3 planned: same mechanism outside retries — cron spread, cache stampedes, pollers.
  Mission lists this as a success criterion; RESOURCES.md flags the source gap.
