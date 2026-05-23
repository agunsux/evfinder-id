/**
 * Simple in‑memory store for tracking active concurrent requests per client.
 * Exported functions: getActiveCount(id), increment(id), decrement(id).
 */
const activeMap = new Map();
export const getActiveCount = (id) => activeMap.get(id) ?? 0;
export const increment = (id) => activeMap.set(id, getActiveCount(id) + 1);
export const decrement = (id) => {
  const cur = getActiveCount(id);
  if (cur <= 1) {
    activeMap.delete(id);
  } else {
    activeMap.set(id, cur - 1);
  }
};
