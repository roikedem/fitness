// Progressive-overload suggestion logic.
//
// Goal (per Roi): don't add +1 every single session — that's too fast and
// implies endless linear growth. Instead, base the next target on a
// recency-weighted AVERAGE of recent actual reps, and grow it at a
// diminishing (non-linear) rate: a bigger relative bump while you're weak,
// tapering toward a gentle nudge as you get strong. The average naturally
// damps a single big day and lets a stall pull the target back down.

export function roundToEven(n: number): number {
  // Round to the nearest even number (ties round up).
  return Math.round(n / 2) * 2;
}

/**
 * Suggest the next target reps for an exercise.
 *
 * @param history recent actual reps, MOST RECENT FIRST (this session included)
 * @param target  the template's default target (used when there's no history)
 * @param perSide asymmetric / per-side moves (lunges, split squats) must get
 *                an EVEN count so both sides are trained equally.
 */
export function suggestNextReps(history: number[], target: number, perSide = false): number {
  const finalize = (n: number): number => {
    let v = Math.max(1, Math.round(n));
    if (perSide) v = Math.max(2, roundToEven(v));
    return v;
  };

  const clean = history.filter((r) => typeof r === "number" && r > 0);
  if (clean.length === 0) return finalize(target);

  // Recency-weighted average of the last few sessions (most recent first).
  const recent = clean.slice(0, 5);
  let weightSum = 0;
  let valueSum = 0;
  recent.forEach((reps, i) => {
    const w = recent.length - i; // newest gets the highest weight
    weightSum += w;
    valueSum += reps * w;
  });
  const avg = valueSum / weightSum;

  // Diminishing growth: ~6% when reps are low, tapering toward ~2% as they
  // climb. At avg≈10 → ~5.8%; at avg≈30 → ~1%→floored to 2%; never below 2%.
  const growth = Math.max(0.02, 0.06 - avg / 600);
  let next = avg * (1 + growth);

  // Guarantee a gentle forward nudge over the demonstrated average, but only
  // by one rep over the AVERAGE (not over the last session) — so a single
  // strong day doesn't ratchet the target up permanently.
  if (Math.round(next) <= Math.round(avg)) next = avg + 1;

  return finalize(next);
}
