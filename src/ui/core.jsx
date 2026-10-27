import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { toCss } from './style';

/** Keep only DOM-safe props and translate the common RN accessibility props. */
const PASS = new Set([
  'id', 'role', 'title', 'tabIndex', 'onClick', 'onMouseEnter', 'onMouseLeave',
  'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp', 'onPointerDown', 'onPointerUp',
  'onTouchStart', 'onTouchEnd', 'onWheel', 'onScroll', 'draggable', 'hidden',
]);
function domProps(props) {
  const out = {};
  for (const k in props) {
    if (PASS.has(k) || k.startsWith('aria-') || k.startsWith('data-')) out[k] = props[k];
  }
  if (props.testID) out['data-testid'] = props.testID;
  if (props.nativeID) out.id = props.nativeID;
  if (props.accessibilityLabel) out['aria-label'] = props.accessibilityLabel;
  if (props.accessibilityRole) out.role = props.accessibilityRole === 'button' ? 'button' : props.accessibilityRole;
  return out;
}

const cx = (...a) => a.filter(Boolean).join(' ');

/* ───────────────────────────── View ───────────────────────────── */
export const View = forwardRef(function View(
  { style, children, pointerEvents, className, ...rest },
  ref,
) {
  const css = toCss(style);
  if (pointerEvents) css.pointerEvents = pointerEvents === 'box-none' ? 'none' : pointerEvents;
  return (
    <div ref={ref} className={cx('rn-view', className)} style={css} {...domProps(rest)}>
      {children}
    </div>
  );
});

export const SafeAreaView = View;
export const KeyboardAvoidingView = View;

/* ───────────────────────────── Text ───────────────────────────── */
export const Text = forwardRef(function Text(
  { style, children, numberOfLines, onPress, selectable, className, ...rest },
  ref,
) {
  const css = toCss(style);
  if (numberOfLines === 1) {
    css.overflow = 'hidden';
    css.textOverflow = 'ellipsis';
    css.whiteSpace = 'nowrap';
    css.display = css.display || 'block';
    css.maxWidth = css.maxWidth ?? '100%';
  } else if (numberOfLines > 1) {
    css.overflow = 'hidden';
    css.display = '-webkit-box';
    css.WebkitBoxOrient = 'vertical';
    css.WebkitLineClamp = numberOfLines;
  }
  if (selectable === false) css.userSelect = 'none';
  const handlers = onPress
    ? {
        onClick: (e) => {
          e.stopPropagation();
          onPress(e);
        },
        role: 'link',
        tabIndex: 0,
      }
    : {};
  if (onPress) css.cursor = css.cursor || 'pointer';
  return (
    <span ref={ref} className={cx('rn-text', className)} style={css} {...domProps(rest)} {...handlers}>
      {children}
    </span>
  );
});

/* ─────────────────────────── Touchables ─────────────────────────── */
function useActivate(onPress, disabled) {
  return {
    onClick: (e) => {
      if (disabled) return;
      if (onPress) {
        e.stopPropagation(); // nested touchables must not trigger their parents
        onPress(e);
      }
    },
    onKeyDown: (e) => {
      if (disabled || !onPress) return;
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        onPress(e);
      }
    },
  };
}

export const TouchableOpacity = forwardRef(function TouchableOpacity(
  { style, children, onPress, onLongPress, disabled, activeOpacity = 0.2, className, ...rest },
  ref,
) {
  const css = toCss(style);
  css['--rn-ao'] = activeOpacity;
  const interactive = !!onPress && !disabled;
  if (!interactive) css.cursor = css.cursor || 'default';
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-disabled={disabled || undefined}
      className={cx('rn-view', interactive && 'rn-touch', className)}
      style={css}
      onTouchStart={() => {}}
      {...domProps(rest)}
      {...useActivate(onPress, disabled)}
    >
      {children}
    </div>
  );
});

export const TouchableHighlight = TouchableOpacity;
export const TouchableWithoutFeedback = function TouchableWithoutFeedback({ children, onPress, style, ...rest }) {
  return (
    <div className="rn-view" style={toCss(style)} onClick={onPress} {...domProps(rest)}>
      {children}
    </div>
  );
};

export const Pressable = forwardRef(function Pressable(
  { style, children, onPress, onPressIn, onPressOut, onLongPress, disabled, className, ...rest },
  ref,
) {
  const [pressed, setPressed] = React.useState(false);
  const state = { pressed, hovered: false, focused: false };
  const css = toCss(typeof style === 'function' ? style(state) : style);
  const interactive = !!onPress && !disabled;
  if (interactive) css.cursor = css.cursor || 'pointer';
  return (
    <div
      ref={ref}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cx('rn-view', className)}
      style={css}
      onPointerDown={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      onPointerLeave={() => setPressed(false)}
      {...domProps(rest)}
      {...useActivate(onPress, disabled)}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  );
});

/* ───────────────────────────── ScrollView ───────────────────────────── */
export const ScrollView = forwardRef(function ScrollView(
  {
    style,
    contentContainerStyle,
    children,
    horizontal,
    showsVerticalScrollIndicator = true,
    showsHorizontalScrollIndicator = true,
    onScroll,
    pagingEnabled,
    className,
    ...rest
  },
  ref,
) {
  const el = useRef(null);
  useImperativeHandle(ref, () => ({
    scrollTo: ({ x = 0, y = 0, animated = true } = {}) =>
      el.current?.scrollTo({ left: x, top: y, behavior: animated ? 'smooth' : 'auto' }),
    scrollToEnd: ({ animated = true } = {}) =>
      el.current?.scrollTo({
        left: horizontal ? el.current.scrollWidth : 0,
        top: horizontal ? 0 : el.current.scrollHeight,
        behavior: animated ? 'smooth' : 'auto',
      }),
    getScrollableNode: () => el.current,
    flashScrollIndicators: () => {},
  }));

  const hideBar = horizontal ? !showsHorizontalScrollIndicator : !showsVerticalScrollIndicator;
  const css = toCss(style);
  if (pagingEnabled) css.scrollSnapType = `${horizontal ? 'x' : 'y'} mandatory`;
  const handleScroll = onScroll
    ? (e) =>
        onScroll({
          nativeEvent: {
            contentOffset: { x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop },
            contentSize: { width: e.currentTarget.scrollWidth, height: e.currentTarget.scrollHeight },
            layoutMeasurement: { width: e.currentTarget.clientWidth, height: e.currentTarget.clientHeight },
          },
        })
    : undefined;

  return (
    <div
      ref={el}
      className={cx('rn-scroll', horizontal ? 'rn-scroll-h' : 'rn-scroll-v', hideBar && 'rn-noscrollbar', className)}
      style={css}
      onScroll={handleScroll}
      {...domProps(rest)}
    >
      <div className={cx('rn-scroll-content', horizontal ? 'rn-scroll-content-h' : 'rn-scroll-content-v')} style={toCss(contentContainerStyle)}>
        {children}
      </div>
    </div>
  );
});

/* ───────────────────────────── Image ───────────────────────────── */
export function Image({ source, style, resizeMode, onLoad, onError, children, ...rest }) {
  const uri = typeof source === 'string' ? source : source?.uri ?? (source && source.default) ?? '';
  const css = toCss(style);
  const fit = resizeMode
    ? { stretch: 'fill', center: 'none', repeat: 'cover' }[resizeMode] || resizeMode
    : css.objectFit || 'cover';
  delete css.objectFit;
  return (
    <div className="rn-view rn-image" style={css} {...domProps(rest)}>
      {uri ? (
        <img
          src={uri}
          alt=""
          draggable={false}
          style={{ objectFit: fit }}
          onLoad={onLoad}
          onError={onError}
        />
      ) : null}
      {children}
    </div>
  );
}
export const ImageBackground = ({ source, style, imageStyle, children, ...rest }) => (
  <View style={[{ overflow: 'hidden' }, style]} {...rest}>
    <Image source={source} style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, imageStyle]} />
    {children}
  </View>
);

/* ───────────────────────────── TextInput ───────────────────────────── */
const INPUT_MODE = {
  'numeric': 'numeric', 'number-pad': 'numeric', 'decimal-pad': 'decimal',
  'phone-pad': 'tel', 'email-address': 'email', 'url': 'url',
};

export const TextInput = forwardRef(function TextInput(
  {
    style, value, defaultValue, onChangeText, onChange, onSubmitEditing, onFocus, onBlur,
    placeholder, placeholderTextColor, secureTextEntry, keyboardType, autoCapitalize,
    autoCorrect, autoFocus, maxLength, editable = true, multiline, numberOfLines,
    returnKeyType, blurOnSubmit, className, ...rest
  },
  ref,
) {
  const el = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => el.current?.focus(),
    blur: () => el.current?.blur(),
    clear: () => {
      if (el.current) el.current.value = '';
      onChangeText?.('');
    },
    isFocused: () => document.activeElement === el.current,
    setNativeProps: () => {},
  }));
  const css = toCss(style);
  if (placeholderTextColor) css['--rn-ph'] = placeholderTextColor;
  const common = {
    ref: el,
    className: cx('rn-input', className),
    style: css,
    value,
    defaultValue,
    placeholder,
    maxLength,
    autoFocus,
    readOnly: !editable,
    inputMode: INPUT_MODE[keyboardType],
    autoCapitalize: autoCapitalize === 'none' ? 'off' : autoCapitalize,
    autoCorrect: autoCorrect === false ? 'off' : undefined,
    enterKeyHint: returnKeyType,
    onFocus,
    onBlur,
    onChange: (e) => {
      onChange?.({ nativeEvent: { text: e.target.value } });
      onChangeText?.(e.target.value);
    },
    ...domProps(rest),
  };
  if (multiline) return <textarea rows={numberOfLines || 2} {...common} />;
  return (
    <input
      type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'text' : 'text'}
      {...common}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmitEditing?.({ nativeEvent: { text: e.currentTarget.value } });
          if (blurOnSubmit !== false && onSubmitEditing) e.currentTarget.blur();
        }
      }}
    />
  );
});

/* ───────────────────────────── ActivityIndicator ───────────────────────────── */
export function ActivityIndicator({ size = 'small', color = '#999999', animating = true, style }) {
  const dim = typeof size === 'number' ? size : size === 'large' ? 36 : 20;
  if (!animating) return null;
  return (
    <div className="rn-view" style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center', ...toCss(style) }}>
      <svg className="rn-spinner" width={dim} height={dim} viewBox="0 0 50 50" role="progressbar" aria-label="Loading">
        <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray="90 150" />
      </svg>
    </div>
  );
}

/* ───────────────────────────── misc no-ops ───────────────────────────── */
export const StatusBar = () => null;
StatusBar.setBarStyle = () => {};
StatusBar.setBackgroundColor = () => {};
export const RefreshControl = () => null;

export function FlatList({ data = [], renderItem, keyExtractor, ListEmptyComponent, ListHeaderComponent, ListFooterComponent, ItemSeparatorComponent, horizontal, numColumns = 1, style, contentContainerStyle, ...rest }) {
  const items = data.map((item, index) => (
    <React.Fragment key={keyExtractor ? keyExtractor(item, index) : item?.id ?? index}>
      {renderItem({ item, index, separators: {} })}
      {ItemSeparatorComponent && index < data.length - 1 ? <ItemSeparatorComponent /> : null}
    </React.Fragment>
  ));
  const grid = numColumns > 1 ? { display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)` } : null;
  return (
    <ScrollView style={style} horizontal={horizontal} contentContainerStyle={[grid, contentContainerStyle]} {...rest}>
      {typeof ListHeaderComponent === 'function' ? <ListHeaderComponent /> : ListHeaderComponent}
      {items.length ? items : typeof ListEmptyComponent === 'function' ? <ListEmptyComponent /> : ListEmptyComponent}
      {typeof ListFooterComponent === 'function' ? <ListFooterComponent /> : ListFooterComponent}
    </ScrollView>
  );
}

/* ───────────────────────────── Switch ───────────────────────────── */
export function Switch({ value = false, onValueChange, disabled, trackColor = {}, thumbColor, style }) {
  const track = value ? trackColor.true || '#34c759' : trackColor.false || '#d1d5db';
  const thumb = thumbColor || '#fff';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      disabled={disabled}
      onClick={() => onValueChange?.(!value)}
      className="rn-switch"
      style={{ background: track, ...toCss(style) }}
    >
      <span className="rn-switch-thumb" style={{ background: thumb, transform: `translateX(${value ? 20 : 0}px)` }} />
    </button>
  );
}
