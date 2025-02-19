﻿// ------------------------------------------------------
//
// # 3x3
// もしガウシアンブラーなら、
// 1/4, 2/4, 1/4 を縦横 => 3 + 3 => 6回 fetch
//
// --------------------------
// | 1 | 2 | 1 |
// | 2 | 4 | 2 | * (1 / 16)
// | 1 | 2 | 1 |
// --------------------------
//
// # 5x5
// もしガウシアンブラーなら、
// 1/16, 4/16, 6/16, 4/16, 1/16 を縦横 => 5 + 5 => 10回 fetch
//
// -------------------------------------
// | 1 | 4  | 6  | 4  | 1 |
// | 4 | 16 | 24 | 16 | 4 |
// | 6 | 24 | 36 | 24 | 6 | * (1/ 256)
// | 4 | 16 | 24 | 16 | 4 |
// | 1 | 4  | 6  | 4  | 1 |
// -------------------------------------
//
// ------------------------------------------------------

/**
 * ref: https://techblog.kayac.com/unity-light-weight-bloom-effect
 * @param sigma
 * @param x
 */
export function gaussCoefficient(sigma: number, x: number) {
    const sigma2 = sigma * sigma;
    return Math.exp(-(x * x) / (2 * sigma2));
}

/**
 * 
 * @param x
 * @param min
 * @param max
 */
export function clamp(x: number, min: number, max: number) {
    return Math.min(max, Math.max(x, min));
}

/**
 * 
 * @param x
 */
export function saturate(x: number) {
    return clamp(x, 0, 1);
}

/**
 * 
 * @param a
 * @param b
 * @param t
 */
export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

/**
 * 
 * @param a
 * @param b
 */
export function randomRange(a: number, b: number) {
    return lerp(a, b, Math.random());
}

/**
 * 
 * @param rad
 */
export function rad2Deg(rad: number) {
    return rad * (180 / Math.PI);
}

/**
 * 
 * @param deg
 */
export function deg2Rad(deg: number) {
    return deg * (Math.PI / 180);
}
