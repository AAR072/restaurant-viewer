function properMod(n: number, b: number) {
  return n < 0 ? n % b + b : n % b;
}

/**
 * Returns the largest integer less than or equal to the given number `n` (essentially, a custom floor function).
 *
 * @param {number} n - The number to be floored.
 * @return {number} - The largest integer less than or equal to `n`.
 * 
 * @timecomplexity O(1) - The operation involves simple arithmetic and modulus, both of which are constant time operations.
 */
function floor(n: number): number {
  return n - properMod(n, 1);
}

function round(n: number): number {
  const remainder = n % 1;

  if (remainder > 0.5) return n - remainder + 1;
  else return n - remainder;
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