/**
 * Clamps a number `n` to the inclusive range [min, max]. If `n` is less than `min`, returns `min`; 
 * if `n` is greater than `max`, returns `max`.
 *
 * @param {number} n - The number to be clamped.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @return {number} - The clamped value of `n`.
 * 
 * @timecomplexity O(1) - Only a few comparisons and assignments are done, all of which are constant time.
 */
function clamp(n: number, min: number, max: number): number {
  if (n < min) n = min;
  if (n > max) n = max;

  return n;
}

/**
 * Returns the maximum of two numbers `a` and `b`.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @return {number} - The larger of the two numbers.
 * 
 * @timecomplexity O(1) - A simple comparison is made, which is constant time.
 */
function getMax(a: number, b: number): number {
  return a < b ? b : a;
}

/**
 * Returns the minimum of two numbers `a` and `b`.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @return {number} - The smaller of the two numbers.
 * 
 * @timecomplexity O(1) - A simple comparison is made, which is constant time.
 */
function getMin(a: number, b: number): number {
  return a > b ? b : a;
}

function abs(n: number) {
  return n < 0 ? -n : n;
}

/**
 * Returns the largest integer less than or equal to the given number `n` (essentially, a custom floor function).
 *
 * @param {number} n - The number to be floored.
 * @return {number} - The largest integer less than or equal to `n`.
 * 
 * @timecomplexity O(1) - The operation involves simple arithmetic and modulus, both of which are constant time operations.
 */
function floor(n: number, b: number = 1): number {
  const r = n % b;

  if (n < 0) return r == 0 ? n : n - r - b;
  else return n - r;
}

// add "base" for flooring (i.e. round to nearest 2, 10, etc.)
// fix all rounding functions to go up/down for negative values too, and add custom floor which always floors towards zero

function ceil(n: number, b: number = 1): number {
  const r = n % b;

  if (n > 0) return r == 0 ? n : n - r + b;
  else return n - r;
}

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
 *
 * @param {number} n - The number to compute the modulo of.
 * @param {number} base - The base to use for the modulo operation.
 * @return {number} The result of `n` modulo `base`, adjusted for negative values to remain positive.
 * 
 * @timecomplexity O(1) - The modulo and comparison operations are constant time.
 */
function circleMod(n: number, base: number): number {
  if (base == 0) return 0;

  n %= base;

  return n < 0 ? n + base : n;
}

function getDistance(x0: number, y0: number, x1: number, y1: number): number {
  return Math.sqrt((x0 - x1)**2 + (y0 - y1)**2);
}

function geoSeries(r: number, n: number) {
  return (r**n - 1)/(r - 1);
}