import React, { useEffect, useReducer } from 'react';
import { View, Text, Image, ScrollView } from './core';
import { flatten } from './style';

/* Minimal JS-driven implementation of RN's Animated API (value, timing,
   sequence, parallel, delay, loop, interpolate) – enough for toasts,
   pulses and fades. */

const bez = (x1, y1, x2, y2) => (t) => {
  if (t <= 0 || t >= 1) return t;
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 24; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    if (Math.abs(x - t) < 1e-5) break;
    x < t ? (lo = u) : (hi = u);
    u = (lo + hi) / 2;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
};
export const Easing = {
  linear: (t) => t,
  ease: bez(0.42, 0, 1, 1),
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  sin: (t) => 1 - Math.cos((t * Math.PI) / 2),
  bezier: bez,
  in: (f) => f,
  out: (f) => (t) => 1 - f(1 - t),
  inOut: (f) => (t) => (t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2),
};

class Value {
  constructor(v) {
    this._v = v;
    this._l = new Set();
  }
  setValue(v) {
    this._v = v;
    this._l.forEach((f) => f(v));
  }
  __getValue() {
    return this._v;
  }
  addListener(fn) {
    this._l.add(fn);
    return fn;
  }
  removeListener(fn) {
    this._l.delete(fn);
  }
  interpolate(cfg) {
    return new Interpolation(this, cfg);
  }
  stopAnimation(cb) {
    cb?.(this._v);
  }
}

class Interpolation {
  constructor(parent, cfg) {
    this.parent = parent;
    this.cfg = cfg;
  }
  __getValue() {
    const { inputRange: inR, outputRange: outR, extrapolate } = this.cfg;
    const x = this.parent.__getValue();
    let i = 1;
    while (i < inR.length - 1 && x > inR[i]) i++;
    let t = (x - inR[i - 1]) / (inR[i] - inR[i - 1] || 1);
    if (extrapolate === 'clamp' || this.cfg.extrapolateRight === 'clamp') t = Math.min(t, 1);
    if (extrapolate === 'clamp' || this.cfg.extrapolateLeft === 'clamp') t = Math.max(t, 0);
    const a = outR[i - 1], b = outR[i];
    if (typeof a === 'number') return a + (b - a) * t;
    const na = String(a).match(/-?\d*\.?\d+/g) || [];
    const nb = String(b).match(/-?\d*\.?\d+/g) || [];
    let k = 0;
    return String(a).replace(/-?\d*\.?\d+/g, () => {
      const v = +na[k] + (+nb[k] - +na[k]) * t;
      k++;
      return v;
    });
  }
  addListener(fn) {
    return this.parent.addListener(fn);
  }
  removeListener(fn) {
    this.parent.removeListener(fn);
  }
  interpolate(cfg) {
    return new Interpolation(this, cfg);
  }
}

const isAnim = (v) => v instanceof Value || v instanceof Interpolation;

function resolveStyle(style) {
  const flat = { ...flatten(style) };
  for (const k in flat) {
    const v = flat[k];
    if (isAnim(v)) flat[k] = v.__getValue();
    else if (k === 'transform' && Array.isArray(v)) {
      flat[k] = v.map((t) => {
        const [name, val] = Object.entries(t)[0];
        return { [name]: isAnim(val) ? val.__getValue() : val };
      });
    }
  }
  return flat;
}
function collect(style, set = new Set()) {
  const flat = flatten(style);
  for (const k in flat) {
    const v = flat[k];
    if (isAnim(v)) set.add(v);
    else if (k === 'transform' && Array.isArray(v))
      v.forEach((t) => {
        const val = Object.values(t)[0];
        if (isAnim(val)) set.add(val);
      });
  }
  return set;
}

function createAnimatedComponent(Comp) {
  return function AnimatedComponent({ style, ...rest }) {
    const [, tick] = useReducer((n) => n + 1, 0);
    const deps = [...collect(style)];
    useEffect(() => {
      const fns = deps.map((d) => d.addListener(tick));
      return () => deps.forEach((d, i) => d.removeListener(fns[i]));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return <Comp style={resolveStyle(style)} {...rest} />;
  };
}

/* ── animations ── */
let rafId = 0;
function timing(value, { toValue, duration = 500, delay = 0, easing = Easing.inOut(Easing.ease) }) {
  let cancelled = false, handle, timeout;
  return {
    start(cb) {
      cancelled = false;
      const from = value.__getValue();
      timeout = setTimeout(() => {
        const t0 = performance.now();
        const step = (now) => {
          if (cancelled) return;
          const p = duration === 0 ? 1 : Math.min(1, (now - t0) / duration);
          value.setValue(p >= 1 ? toValue : from + (toValue - from) * easing(p));
          if (p < 1) handle = requestAnimationFrame(step);
          else cb?.({ finished: true });
        };
        handle = requestAnimationFrame(step);
      }, delay);
    },
    stop() {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(handle);
    },
    reset() {},
  };
}

const sequence = (anims) => {
  let stopped = false;
  return {
    start(cb) {
      stopped = false;
      let i = 0;
      const next = (res) => {
        if (stopped) return cb?.({ finished: false });
        if (i >= anims.length) return cb?.({ finished: true });
        anims[i++].start(next);
      };
      next();
    },
    stop() {
      stopped = true;
      anims.forEach((a) => a.stop());
    },
    reset() {},
  };
};
const parallel = (anims) => ({
  start(cb) {
    let n = 0;
    if (!anims.length) return cb?.({ finished: true });
    anims.forEach((a) => a.start(() => ++n === anims.length && cb?.({ finished: true })));
  },
  stop: () => anims.forEach((a) => a.stop()),
  reset() {},
});
const delay = (ms) => {
  let t;
  return { start: (cb) => (t = setTimeout(() => cb?.({ finished: true }), ms)), stop: () => clearTimeout(t), reset() {} };
};
const loop = (anim, { iterations = -1 } = {}) => {
  let stopped = false;
  return {
    start(cb) {
      stopped = false;
      let n = 0;
      const run = () => {
        if (stopped || (iterations !== -1 && n >= iterations)) return cb?.({ finished: !stopped });
        n++;
        anim.reset?.();
        anim.start(run);
      };
      run();
    },
    stop() {
      stopped = true;
      anim.stop();
    },
    reset() {},
  };
};

export const Animated = {
  Value,
  ValueXY: Value,
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  ScrollView: createAnimatedComponent(ScrollView),
  createAnimatedComponent,
  timing,
  spring: (v, c) => timing(v, { duration: 300, ...c }),
  sequence,
  parallel,
  delay,
  loop,
  stagger: (ms, anims) => parallel(anims.map((a, i) => sequence([delay(ms * i), a]))),
  event: () => () => {},
};
