/*
  backoff-sim.js — pure simulation engine for retry/backoff micro-worlds.
  No DOM, no dependencies, works over file://. Lessons import this and do
  their own rendering.

  Model: discrete ticks. All clients arrive at tick 0. Each tick the server
  accepts at most `capacity` requests; the rest are throttled and reschedule
  themselves using the chosen backoff strategy. Deterministic given a seed,
  so runs can be replayed and compared.

  Strategy formulas follow Marc Brooker, "Exponential Backoff And Jitter",
  AWS Architecture Blog, 4 Mar 2015.
*/

/* Seeded PRNG — deterministic replay is the whole point of the micro-world. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRATEGIES = {
  none: {
    label: 'No jitter (plain exponential)',
    formula: 'sleep = min(cap, base * 2^attempt)',
    next: (c, p) => Math.min(p.cap, p.base * Math.pow(2, c.attempt)),
  },
  full: {
    label: 'Full jitter',
    formula: 'sleep = random(0, min(cap, base * 2^attempt))',
    next: (c, p, rand) => rand() * Math.min(p.cap, p.base * Math.pow(2, c.attempt)),
  },
  equal: {
    label: 'Equal jitter',
    formula: 'temp = min(cap, base * 2^attempt); sleep = temp/2 + random(0, temp/2)',
    next: (c, p, rand) => {
      const temp = Math.min(p.cap, p.base * Math.pow(2, c.attempt));
      return temp / 2 + rand() * (temp / 2);
    },
  },
  decorr: {
    label: 'Decorrelated jitter',
    formula: 'sleep = min(cap, random(base, sleep_prev * 3))',
    next: (c, p, rand) => {
      const hi = Math.max(p.base, c.prev * 3);
      const s = Math.min(p.cap, p.base + rand() * (hi - p.base));
      c.prev = s;
      return s;
    },
  },
};

/*
  runSim({clients, capacity, base, cap, strategy, seed, maxTicks})
  -> { ticks, totalCalls, wastedCalls, finishTick, peak, peakRetry,
       activeTicks, completed, remaining, truncated, params }

  `ticks[i]` is {served, failed} for tick i.

  `peakRetry` is the headline correlation read-out: the largest number of
  requests landing on any single tick AFTER tick 0. Tick 0 always carries the
  whole fleet no matter what the strategy is, so overall `peak` cannot
  distinguish strategies — only the retry bursts can. A peakRetry close to
  the fleet size means the herd is still moving as one block.
*/
function runSim(opts) {
  const p = {
    clients: 40, capacity: 5, base: 2, cap: 32,
    strategy: 'none', seed: 7, maxTicks: 600,
    ...opts,
  };
  const strat = STRATEGIES[p.strategy] || STRATEGIES.none;
  const rand = mulberry32(p.seed);

  const clients = [];
  for (let i = 0; i < p.clients; i++) {
    clients.push({ id: i, nextTick: 0, attempt: 0, prev: p.base, done: false });
  }
  /* Bucket by scheduled tick so we never rescan the whole fleet each tick. */
  const schedule = new Map();
  const enqueue = (c) => {
    if (!schedule.has(c.nextTick)) schedule.set(c.nextTick, []);
    schedule.get(c.nextTick).push(c);
  };
  clients.forEach(enqueue);

  const ticks = [];
  let totalCalls = 0, pending = p.clients, finishTick = null;
  let peak = 0, peakRetry = 0, activeTicks = 0;
  let tick = 0;

  while (pending > 0 && tick <= p.maxTicks) {
    const arrivals = schedule.get(tick) || [];
    /* Deterministic service order: lowest client id first. */
    arrivals.sort((a, b) => a.id - b.id);

    let served = 0, failed = 0;
    for (const c of arrivals) {
      totalCalls++;
      if (served < p.capacity) {
        served++; c.done = true; pending--;
      } else {
        failed++;
        const sleep = strat.next(c, p, rand);
        c.attempt++;
        c.nextTick = tick + Math.max(1, Math.round(sleep));
        enqueue(c);
      }
    }
    schedule.delete(tick);

    ticks.push({ served, failed });
    const load = served + failed;
    if (load > 0) activeTicks++;
    if (load > peak) peak = load;
    if (tick > 0 && load > peakRetry) peakRetry = load;
    if (pending === 0) finishTick = tick;
    tick++;
  }

  return {
    ticks,
    totalCalls,
    wastedCalls: totalCalls - (p.clients - pending),
    finishTick,
    peak,
    peakRetry,
    activeTicks,
    completed: pending === 0,
    remaining: pending,
    truncated: pending > 0,
    params: p,
  };
}
