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
        else go('replace')('Login');
      },
      canGoBack: () => (window.history.state?.idx ?? 0) > 0,
      reset: ({ routes: rs = [], index = 0 } = {}) => rs[index] && go('replace')(rs[index].name, rs[index].params),
      popToTop: () => go('replace')('Login'),
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

/** Renders the screen matching the current URL, passing `navigation` + `route`. */
export function Routes({ fallback: Fallback }) {
  const { loc, routes, navigation } = useRouter();
  const match = routes.find((r) => r.path === loc.path);
  if (!match) return Fallback ? <Fallback navigation={navigation} /> : null;
  const Screen = match.component;
  const route = { name: match.name, path: match.path, params: loc.params || {} };
  return (
    <div key={loc.path} className="screen-enter">
      <Screen navigation={navigation} route={route} />
    </div>
  );
}
