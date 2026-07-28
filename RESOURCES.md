# Backoff Jitter Resources

## Knowledge

- [Article: "Exponential Backoff And Jitter" — Marc Brooker, AWS Architecture Blog (4 Mar 2015)](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
  The primary source. Defines the three named strategies — Full, Equal, and Decorrelated jitter —
  against a no-jitter baseline, and simulates them under contention. Use for: the canonical
  formulas, and the finding that Full Jitter wins on both total work and completion time while
  Equal Jitter takes measurably longer.

- [Article: "What is Backoff For?" — Marc Brooker (11 Aug 2022)](https://brooker.co.za/blog/2022/08/11/backoff.html)
  The corrective to over-applying the 2015 post. Argues backoff only helps long-term if it
  reduces *total work* — with unbounded clients it merely defers load. Use for: knowing the
  limits of the mechanism, and for the line "the only way to deal with long-term overload is
  to reduce load."

- [Article: "Timeouts, retries, and backoff with jitter" — AWS Builders' Library](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter)
  Operational framing: retries as load amplification, and where jitter sits among timeouts,
  retry budgets, and circuit breakers. Use for: the production checklist around jitter.
  Note: page is JavaScript-rendered and could not be machine-read on 2026-07-27; contents
  above are from the title and the AWS Builders' Library index, not a verified read.

## Wisdom (Communities)

- [Marc Brooker's blog](https://brooker.co.za/blog/) — an AWS principal engineer writing
  primarily on distributed-systems control theory, retries, and overload. Use for: judgement
  calls where the textbook answer and the operational answer diverge.

## Gaps

- No verified read yet of the AWS Builders' Library article (JS-rendered).
- No source yet on jitter outside retries — cron spread, cache-stampede / TTL jitter,
  poller desynchronisation. The mission lists this as a success criterion, so it needs one.
- No source yet quantifying the *cost* side of jitter (tail latency added to an individual
  request in exchange for fleet-wide smoothing).
