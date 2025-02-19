import { MarionetterCurveKeyframe } from '@/Marionetter/types';

/**
 *
 * @param t
 * @param k0
 * @param k1
 */
function curveUtilityEvaluateRaw(t: number, k0: MarionetterCurveKeyframe, k1: MarionetterCurveKeyframe) {
    // p(t) = (2t^3 - 3t^2 + 1)p0 + (t^3 - 2t^2 + t)m0 + (-2t^3 + 3t^2)p1 + (t^3 - t^2)m1;

    const dt = k1.t - k0.t;

    const m0 = k0.o * dt;
    const m1 = k1.i * dt;

    const t2 = t * t;
    const t3 = t2 * t;

    const a = 2 * t3 - 3 * t2 + 1;
    const b = t3 - 2 * t2 + t;
    const c = t3 - t2;
    const d = -2 * t3 + 3 * t2;

    return a * k0.v + b * m0 + c * m1 + d * k1.v;
}

/**
 *
 * @param t
 * @param k0
 * @param k1
 */
function curveUtilityEvaluate(t: number, k0: MarionetterCurveKeyframe, k1: MarionetterCurveKeyframe) {
    // const rt = Mathf.InverseLerp(k0.time, k1.time, t);
    const rt = (t - k0.t) / (k1.t - k0.t);
    return curveUtilityEvaluateRaw(rt, k0, k1);
}

/**
 *
 * @param t
 * @param keys
 */
export function curveUtilityEvaluateCurve(t: number, keys: MarionetterCurveKeyframe[]): number {
    // TODO: infinite前提の場合はt自体をclampしてもよいかもしれない

    // const keys = curve.keys;

    if (keys.length === 0) {
        console.warn('curve.keys.Length == 0');
        return 0;
    }

    if (keys.length === 1) {
        return keys[0].v;
    }

    if (t < keys[0].t) {
        return keys[0].v;
    }

    if (t >= keys[keys.length - 1].t) {
        return keys[keys.length - 1].v;
    }

    // TODO: keyframeが多いとループ数が増えるのでtimeをbinarysearchかけるとよい
    for (let i = 0; i < keys.length - 1; i++) {
        const k0 = keys[i];
        const k1 = keys[i + 1];
        if (k0.t <= t && t < k1.t) {
            // for debug
            //Debug.Log($"time: {t}, k0.time: {k0.time}");
            //Debug.Log($"{i} -> {i + 1}");
            return curveUtilityEvaluate(t, k0, k1);
        }
    }

    // throw new Error(`invalid curve or time. t: ${t}, curve keyframe length: ${curve.keys.Length}`)
    console.error(`invalid curve or time. t: ${t}`);
    return 0;
}
