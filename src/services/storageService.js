export function loadState(storageKey, defaultState) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      inventories: { ...defaultState.inventories, ...(parsed.inventories || {}) },
      shoppingLists: { ...defaultState.shoppingLists, ...(parsed.shoppingLists || {}) },
      challenges: { ...defaultState.challenges, ...(parsed.challenges || {}) },
    };
  } catch {
    return defaultState;
  }
}

export function persistState(storageKey, state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}