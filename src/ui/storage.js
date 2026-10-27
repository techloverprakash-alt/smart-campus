/** Drop-in replacement for AsyncStorage, backed by localStorage. */
const mem = new Map();
const safe = (fn, fallback) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

const storage = {
  async getItem(k) {
    return safe(() => window.localStorage.getItem(k), mem.get(k) ?? null);
  },
  async setItem(k, v) {
    mem.set(k, v);
    safe(() => window.localStorage.setItem(k, v));
  },
  async removeItem(k) {
    mem.delete(k);
    safe(() => window.localStorage.removeItem(k));
  },
  async clear() {
    mem.clear();
    safe(() => window.localStorage.clear());
  },
};
export default storage;
