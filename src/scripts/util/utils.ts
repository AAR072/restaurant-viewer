/**
 * Returns the maximum of two numbers `a` and `b`.
 * @param a The first number.
 * @param b The second number.
 * @return The larger of the two numbers.
 * @timecomplexity O(1)
 */
function getMax(a: number, b: number): number {
  return a < b ? b : a;
}

/**
 * Returns the minimum of two numbers `a` and `b`.
 * @param a The first number.
 * @param b The second number.
 * @return The smaller of the two numbers.
 * @timecomplexity O(1)
 */
function getMin(a: number, b: number): number {
  return a > b ? b : a;
}

/**
 * Clamps a number `n` to the inclusive range [`min`, `max`] so that it is no less than `min` and no greater than `max`.
 * @param n The number to be clamped.
 * @param min The lower bound.
 * @param max The upper bound.
 * @return The clamped value of `n`.
 * @timecomplexity O(1)
 */
function clamp(n: number, min: number, max: number): number {
  if (n < min) n = min;
  if (n > max) n = max;

  return n;
}

/**
 * Gets the absolute value of `n`, making negative values positive.
 * @param n The number.
 * @returns The absolute value of `n`.
 * @timecomplexity O(1)
 */
function abs(n: number) {
  return n < 0 ? -n : n;
}

/**
 * Rounds `n` down to the nearest multiple of `b`.
 * @param n The number being floored.
 * @param b The base to floor `n` to.
 * @return The floored value.
 * @timecomplexity O(1)
 */
function floor(n: number, b: number = 1): number {
  const r = n % b;

  if (n < 0) return r == 0 ? n : n - r - b;
  else return n - r;
}

/**
 * Rounds `n` up to the nearest multiple of `b`.
 * @param n The number being rounded up.
 * @param b The base to round `n` up to.
 * @returns The rounded up value.
 * @timecomplexity O(1)
 */
function ceil(n: number, b: number = 1): number {
  const r = n % b;

  if (n > 0) return r == 0 ? n : n - r + b;
  else return n - r;
}

/**
 * Rounds `n` to the nearest multiple of `b`, either up or down.
 * @param n The number being rounded.
 * @param b The base to round `n` to.
 * @returns The rounded value of `n`.
 * @timecomplexity O(1)
 */
function round(n: number, b: number = 1): number {
  const r = abs(n % b);

  if (r < b/2) {
    return floor(n, b);

  } else {
    return ceil(n, b);
  }
}

/**
 * Computes `n` modulo `base` with circular behavior for negative numbers (always returns a positive remainder).
 * @param n The number to compute the modulo of.
 * @param base The base to use for the modulo operation.
 * @return The result of `n` modulo `base`, adjusted for negative values to remain positive.
 * @timecomplexity O(1)
 */
function circleMod(n: number, base: number): number {
  if (base == 0) return 0;

  n %= base;

  return n < 0 ? n + base : n;
}

/**
 * Gets the magnitudal distance between two points (`x0`, `y0`) and (`x1`, `y1`).
 * @param x0 The x value of point 1.
 * @param y0 The y value of point 1.
 * @param x1 The x value of point 2.
 * @param y1 The y value of point 2.
 * @returns The distance between the two points.
 * @timecomplexity O(1)
 */
function getDistance(x0: number, y0: number, x1: number, y1: number): number {
  return Math.sqrt((x0 - x1)**2 + (y0 - y1)**2);
}

/**
 * Returns the sum of the geometric series with the common ratio `r` and `n` terms.
 * @param r The common ratio of the series.
 * @param n The number of terms in the series.
 * @returns The geometric sum of the series.
 * @timecomplexity O(1)
 */
function geoSeries(r: number, n: number) {
  return (r**n - 1)/(r - 1);
}

/**
 * Gets the lerped progress of `n0` to `n1` based on the percentage progress `t`.
 * @param n0 The start value of the lerp.
 * @param n1 The end value of the lerp.
 * @param t The percentage of the lerp, 0 being at the start and 1 being at the end.
 * @returns The lerped value.
 * @timecomplexity O(1)
 */
function lerp(n0: number, n1: number, t: number) {
  return n0 + (n1 - n0)*t;
}