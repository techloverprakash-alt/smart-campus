/**
 * Style translation: React-Native-style objects -> DOM inline CSS.
 *
 * The screens in this project describe styling as plain objects
 * (`StyleSheet.create({...})`). This module flattens those objects (arrays,
 * falsy values) and converts the handful of RN-only properties (shadow*,
 * paddingHorizontal, transform arrays, ...) into valid CSS.
 */

const SIDES = ['Top', 'Right', 'Bottom', 'Left'];

/** Flatten nested arrays / falsy values into one plain object. */
export function flatten(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    const out = {};
    for (const s of style) Object.assign(out, flatten(s));
    return out;
  }
  if (typeof style === 'object') return style;
  return {};
}

const px = (v) => (typeof v === 'number' ? `${v}px` : v);

/** Apply alpha to any CSS colour string. */
export function withAlpha(color, alpha) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  const c = String(color).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c);
  if (m) {
    const [r, g, b] = m[1].split('').map((x) => parseInt(x + x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c);
  if (m) {
    const n = parseInt(m[1], 16);
    const a = m[2] ? (parseInt(m[2], 16) / 255) * alpha : alpha;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${+a.toFixed(3)})`;
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(c);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    return `rgba(${r},${g},${b},${+(a * alpha).toFixed(3)})`;
  }
  if (c === 'black') return `rgba(0,0,0,${alpha})`;
  if (c === 'white') return `rgba(255,255,255,${alpha})`;
  if (c === 'transparent') return 'transparent';
  return `color-mix(in srgb, ${c} ${Math.round(alpha * 100)}%, transparent)`;
}

function transformToCss(list) {
  if (!Array.isArray(list)) return list;
  return list
    .map((t) => {
      const [k, v] = Object.entries(t)[0];
      if (/^translate/.test(k)) return `${k}(${px(v)})`;
      if (/^(rotate|skew)/.test(k)) return `${k}(${typeof v === 'number' ? v + 'deg' : v})`;
      return `${k}(${v})`;
    })
    .join(' ');
}

const DROP = new Set([
  'elevation', 'textAlignVertical', 'includeFontPadding', 'tintColor',
  'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius',
  'paddingHorizontal', 'paddingVertical', 'padding',
  'marginHorizontal', 'marginVertical', 'margin',
  'borderWidth', 'borderStyle', 'writingDirection', 'resizeMode',
  'textShadowOffset', 'textShadowRadius', 'textShadowColor', 'overlayColor',
  'paddingStart', 'paddingEnd', 'marginStart', 'marginEnd',
  'start', 'end', 'borderStartWidth', 'borderEndWidth',
]);

/** Convert an RN style (object | array | falsy) into a React `style` object. */
export function toCss(input) {
  const s = flatten(input);
  const out = {};

  // padding / margin with RN precedence (side > axis > all)
  for (const kind of ['padding', 'margin']) {
    const all = s[kind];
    const v = s[`${kind}Vertical`];
    const h = s[`${kind}Horizontal`];
    const per = {
      Top: s[`${kind}Top`] ?? v ?? all,
      Bottom: s[`${kind}Bottom`] ?? v ?? all,
      Left: s[`${kind}Left`] ?? s[`${kind}Start`] ?? h ?? all,
      Right: s[`${kind}Right`] ?? s[`${kind}End`] ?? h ?? all,
    };
    for (const side of SIDES) if (per[side] !== undefined) out[`${kind}${side}`] = px(per[side]);
  }

  // borders: RN defaults to solid; CSS needs explicit 0 widths on other sides
  const hasBorder =
    s.borderWidth !== undefined ||
    SIDES.some((side) => s[`border${side}Width`] !== undefined);
  if (hasBorder) {
    for (const side of SIDES) {
      out[`border${side}Width`] = px(s[`border${side}Width`] ?? s.borderWidth ?? 0);
    }
    out.borderStyle = s.borderStyle || 'solid';
  } else if (s.borderStyle) {
    out.borderStyle = s.borderStyle;
  }

  // shadows
  if (s.shadowOpacity > 0 && (s.shadowColor || s.shadowRadius || s.shadowOffset)) {
    const off = s.shadowOffset || { width: 0, height: 0 };
    out.boxShadow = `${off.width || 0}px ${off.height || 0}px ${s.shadowRadius ?? 0}px ${withAlpha(
      s.shadowColor || '#000',
      s.shadowOpacity,
    )}`;
  } else if (s.elevation > 0 && s.boxShadow === undefined) {
    const e = s.elevation;
    out.boxShadow = `0 ${Math.ceil(e / 2)}px ${Math.ceil(e * 1.5)}px rgba(0,0,0,0.18)`;
  }

  if (s.textShadowColor || s.textShadowRadius) {
    const off = s.textShadowOffset || { width: 0, height: 0 };
    out.textShadow = `${off.width}px ${off.height}px ${s.textShadowRadius || 0}px ${s.textShadowColor || '#000'}`;
  }

  if (s.resizeMode) {
    out.objectFit = { stretch: 'fill', center: 'none', repeat: 'cover' }[s.resizeMode] || s.resizeMode;
  }

  for (const [k, v] of Object.entries(s)) {
    if (v === undefined || v === null || DROP.has(k)) continue;
    if (k === 'transform') out.transform = transformToCss(v);
    else if (k === 'lineHeight') out.lineHeight = px(v);
    else if (k === 'fontVariant') out.fontVariantNumeric = Array.isArray(v) ? v.join(' ') : v;
    else if (k === 'fontFamily' && v === 'System') out.fontFamily = 'inherit';
    else out[k] = v;
  }
  return out;
}

export const StyleSheet = {
  create: (styles) => styles,
  flatten,
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  compose: (a, b) => [a, b],
};
