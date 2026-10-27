import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { toCss } from './style';

/* ───────────────────────────── Platform / Dimensions ───────────────────────────── */
export const Platform = {
  OS: 'web',
  Version: 1,
  select: (spec) => ('web' in spec ? spec.web : spec.default),
};

const isBrowser = typeof window !== 'undefined';
const read = () => ({
  width: isBrowser ? window.innerWidth : 1024,
  height: isBrowser ? window.innerHeight : 768,
  scale: isBrowser ? window.devicePixelRatio || 1 : 1,
  fontScale: 1,
});

export const Dimensions = {
  get: () => read(),
  addEventListener: (type, cb) => {
    if (type !== 'change' || !isBrowser) return { remove() {} };
    const h = () => cb({ window: read(), screen: read() });
    window.addEventListener('resize', h);
    return { remove: () => window.removeEventListener('resize', h) };
  },
};

let snapshot = read();
function subscribe(cb) {
  const h = () => {
    const n = read();
    if (n.width !== snapshot.width || n.height !== snapshot.height) {
      snapshot = n;
      cb();
    }
  };
  window.addEventListener('resize', h);
  window.addEventListener('orientationchange', h);
  return () => {
    window.removeEventListener('resize', h);
    window.removeEventListener('orientationchange', h);
  };
}
/** Live window size – re-renders on resize. */
export function useWindowDimensions() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

/** Layout tier derived from window width. */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100,
    isDesktop: width >= 1100,
    isWide: width >= 768,
  };
}

export const useColorScheme = () => 'light';
export const Keyboard = { dismiss: () => document.activeElement?.blur?.(), addListener: () => ({ remove() {} }) };
export const PixelRatio = { get: () => (isBrowser ? window.devicePixelRatio || 1 : 1) };

/* ───────────────────────────── Linking / Share ───────────────────────────── */
export const Linking = {
  async openURL(url) {
    if (/^(mailto|tel|sms):/i.test(url)) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  },
  async canOpenURL() {
    return true;
  },
};

export const Share = {
  async share({ message, title, url }) {
    const text = [message, url].filter(Boolean).join('\n');
    if (navigator.share) {
      await navigator.share({ title, text });
      return { action: 'sharedAction' };
    }
    await navigator.clipboard.writeText(text);
    Alert.alert(title || 'Copied', 'Copied to clipboard.');
    return { action: 'sharedAction' };
  },
};

/* ───────────────────────────── Modal ───────────────────────────── */
export function Modal({ visible, transparent, animationType = 'none', onRequestClose, children }) {
  useEffect(() => {
    if (!visible || !onRequestClose) return undefined;
    const h = (e) => e.key === 'Escape' && onRequestClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [visible, onRequestClose]);
  if (!visible || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={['rn-modal', `rn-modal--${animationType}`, !transparent && 'rn-modal--opaque'].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>,
    document.body,
  );
}

/* ───────────────────────────── Alert ───────────────────────────── */
const alertListeners = new Set();
let alertQueue = [];
const emit = () => alertListeners.forEach((l) => l());

export const Alert = {
  alert(title, message, buttons, options) {
    alertQueue = [...alertQueue, { title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }], options, id: Math.random() }];
    emit();
  },
};

/** Mount once near the app root: renders pending Alert.alert() dialogs. */
export function AlertHost() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    alertListeners.add(l);
    return () => alertListeners.delete(l);
  }, []);
  const current = alertQueue[0];
  useEffect(() => {
    if (!current) return undefined;
    const h = (e) => e.key === 'Escape' && close(null, true);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  if (!current) return null;

  function close(btn, dismissed) {
    alertQueue = alertQueue.slice(1);
    emit();
    if (dismissed) {
      const cancel = current.buttons.find((b) => b.style === 'cancel');
      if (current.options?.cancelable === false) {
        alertQueue = [current, ...alertQueue];
        emit();
        return;
      }
      current.options?.onDismiss?.();
      cancel?.onPress?.();
    } else btn?.onPress?.();
  }

  const stacked = current.buttons.length > 2;
  return createPortal(
    <div className="rn-alert-backdrop" onClick={() => close(null, true)}>
      <div className="rn-alert" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {current.title ? <div className="rn-alert-title">{current.title}</div> : null}
        {current.message ? <div className="rn-alert-message">{current.message}</div> : null}
        <div className={`rn-alert-buttons${stacked ? ' stacked' : ''}`}>
          {current.buttons.map((b, i) => (
            <button
              key={i}
              autoFocus={i === current.buttons.length - 1}
              className={`rn-alert-btn ${b.style || ''}`}
              onClick={() => close(b)}
            >
              {b.text || 'OK'}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────────────────────── Gradient / Blur ───────────────────────────── */
export function LinearGradient({ colors = [], start, end, locations, style, children, className, ...rest }) {
  const s = start || { x: 0.5, y: 0 };
  const e = end || { x: 0.5, y: 1 };
  const angle = (Math.atan2(e.x - s.x, -(e.y - s.y)) * 180) / Math.PI;
  const stops = colors
    .map((c, i) => (locations?.[i] != null ? `${c} ${locations[i] * 100}%` : c))
    .join(', ');
  return (
    <div className={['rn-view', className].filter(Boolean).join(' ')} style={{ ...toCss(style), backgroundImage: `linear-gradient(${angle.toFixed(1)}deg, ${stops})` }} {...rest}>
      {children}
    </div>
  );
}

export function BlurView({ intensity = 50, tint = "light", style, children, className }) {
  const blur = Math.max(2, Math.round(intensity / 4));
  const bg = tint === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.55)';
  return (
    <div
      className={['rn-view', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: bg, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, ...toCss(style) }}
    >
      {children}
    </div>
  );
}
