/**
 * Tiny history-API router that keeps the screens' `navigation` / `route`
 * contract:
 *
 *   navigation.navigate('StudentDashboard', params)
 *   navigation.replace('Login')
 *   navigation.goBack() / canGoBack()
 *   route.params
 *
 * Every screen has a real URL (see ROUTES) so refresh, deep links and the
 * browser back/forward buttons work.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);

const readState = () => ({
  path: window.location.pathname.replace(/\/+$/, '') || '/',
  idx: window.history.state?.idx ?? 0,
  params: window.history.state?.params ?? undefined,
});

export function RouterProvider({ routes, children }) {
  const [loc, setLoc] = useState(readState);

  const byName = useMemo(() => Object.fromEntries(routes.map((r) => [r.name, r])), [routes]);
  const toPath = useCallback(
    (target) => (target.startsWith('/') ? target : byName[target]?.path),
    [byName],
  );

  useEffect(() => {
    if (window.history.state?.idx === undefined) {
      window.history.replaceState({ idx: 0 }, '', window.location.pathname + window.location.search);
    }
    const onPop = () => setLoc(readState());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const api = useMemo(() => {
    const go = (mode) => (target, params) => {
      const path = toPath(target);
      if (!path) {
        console.warn(`[router] Unknown route "${target}"`);
        return;
      }
      const idx = mode === 'push' ? (window.history.state?.idx ?? 0) + 1 : window.history.state?.idx ?? 0;
      window.history[mode === 'push' ? 'pushState' : 'replaceState']({ idx, params }, '', path);
      setLoc({ path, idx, params });
      window.scrollTo?.(0, 0);
    };
    const navigate = go('push');
    return {
      navigate,
      push: navigate,
      replace: go('replace'),
      goBack: () => {
        if ((window.history.state?.idx ?? 0) > 0) window.history.back();
        else go('replace')('CommonPortal');
      },
      canGoBack: () => (window.history.state?.idx ?? 0) > 0,
      reset: ({ routes: rs = [], index = 0 } = {}) => rs[index] && go('replace')(rs[index].name, rs[index].params),
      popToTop: () => go('replace')('CommonPortal'),
      setOptions: () => {},
      addListener: () => () => {},
      isFocused: () => true,
      getParent: () => null,
    };
  }, [toPath]);

  const value = useMemo(() => ({ loc, routes, navigation: api }), [loc, routes, api]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);
export const useNavigation = () => useContext(RouterContext).navigation;
export const useRoute = () => {
  const { loc, routes } = useContext(RouterContext);
  const match = routes.find((r) => r.path === loc.path);
  return { name: match?.name, path: loc.path, params: loc.params || {} };
};

class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Screen render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#1e293b' }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: 24, marginBottom: 16 }}>⚠</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>Something went wrong loading this screen</h2>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '0 0 16px 0' }}>
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '8px 18px', borderRadius: 8, background: '#1d4ed8', color: '#fff', border: 0, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Renders the screen matching the current URL, passing `navigation` + `route`. */
export function Routes({ fallback: Fallback }) {
  const { loc, routes, navigation } = useRouter();
  const match = routes.find((r) => r.path === loc.path);
  if (!match) return Fallback ? <Fallback navigation={navigation} /> : null;
  const Screen = match.component;
  const route = { name: match.name, path: match.path, params: loc.params || {} };
  return (
    <div key={loc.path} className="screen-enter">
      <ScreenErrorBoundary key={loc.path}>
        <Screen navigation={navigation} route={route} />
      </ScreenErrorBoundary>
    </div>
  );
}
