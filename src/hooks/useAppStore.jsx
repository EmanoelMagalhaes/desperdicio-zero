import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEY, defaultState } from '../data/defaultState';
import { loginWithMode, registerClientAccount } from '../services/authService';
import { loadState, persistState } from '../services/storageService';
import { daysUntil } from '../utils/date';
import { createId } from '../utils/ids';

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [session, setSession] = useState(null);
  const [adminSelectedClientId, setAdminSelectedClientId] = useState('cliente-demo');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadState(STORAGE_KEY, defaultState);
    setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    persistState(STORAGE_KEY, state);
  }, [ready, state]);

  useEffect(() => {
    if (session?.role !== 'admin') return;
    const exists = state.clientAccounts.some((client) => client.id === adminSelectedClientId);

    if (!exists) {
      setAdminSelectedClientId(state.clientAccounts[0]?.id || '');
    }
  }, [session, state.clientAccounts, adminSelectedClientId]);

  const activeClientId = useMemo(() => {
    if (session?.role === 'client') return session.id;
    if (session?.role === 'admin') return adminSelectedClientId || state.clientAccounts[0]?.id || '';
    return '';
  }, [session, adminSelectedClientId, state.clientAccounts]);

  const activeClient = useMemo(
    () => state.clientAccounts.find((client) => client.id === activeClientId) || null,
    [state.clientAccounts, activeClientId]
  );

  const inventory = useMemo(() => state.inventories[activeClientId] || [], [state.inventories, activeClientId]);
  const shoppingList = useMemo(() => state.shoppingLists[activeClientId] || [], [state.shoppingLists, activeClientId]);
  const challengeState = useMemo(
    () => state.challenges[activeClientId] || { completed: [], current: [] },
    [state.challenges, activeClientId]
  );

  const demoInventory = state.inventories['cliente-demo'] || [];
  const demoShoppingList = state.shoppingLists['cliente-demo'] || [];
  const demoChallenges = state.challenges['cliente-demo'] || { completed: [], current: [] };

  const pendingCount = useMemo(() => {
    if (!session) return 0;

    if (session.role === 'client') {
      return inventory.filter((item) => daysUntil(item.expiry) <= 2).length;
    }

    return Object.values(state.inventories)
      .flat()
      .filter((item) => daysUntil(item.expiry) <= 2).length;
  }, [session, state.inventories, inventory]);

  const login = useCallback(
    (mode, email, password) => {
      const result = loginWithMode(state, mode, email, password);
      if (!result.ok) return result;

      setSession(result.account);
      if (result.account.role === 'admin') {
        setAdminSelectedClientId(state.clientAccounts[0]?.id || '');
      }
      return { ok: true, account: result.account };
    },
    [state]
  );

  const register = useCallback(
    (form) => {
      const result = registerClientAccount(state, form);
      if (!result.ok) return result;

      setState(result.nextState);
      setSession(result.account);
      return { ok: true, account: result.account };
    },
    [state]
  );

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const addInventory = useCallback(
    (item, clientId = activeClientId) => {
      if (!clientId) return;

      const payload = { ...item, id: item.id || createId('item') };
      setState((prev) => ({
        ...prev,
        inventories: {
          ...prev.inventories,
          [clientId]: [...(prev.inventories[clientId] || []), payload],
        },
      }));
    },
    [activeClientId]
  );

  const deleteInventory = useCallback(
    (id, clientId = activeClientId) => {
      if (!clientId) return;

      setState((prev) => ({
        ...prev,
        inventories: {
          ...prev.inventories,
          [clientId]: (prev.inventories[clientId] || []).filter((item) => item.id !== id),
        },
      }));
    },
    [activeClientId]
  );

  const addShopping = useCallback(
    (item, clientId = activeClientId) => {
      if (!clientId) return;

      const payload = { ...item, id: item.id || createId('shop'), checked: Boolean(item.checked) };
      setState((prev) => ({
        ...prev,
        shoppingLists: {
          ...prev.shoppingLists,
          [clientId]: [...(prev.shoppingLists[clientId] || []), payload],
        },
      }));
    },
    [activeClientId]
  );

  const toggleShopping = useCallback(
    (id, clientId = activeClientId) => {
      if (!clientId) return;

      setState((prev) => ({
        ...prev,
        shoppingLists: {
          ...prev.shoppingLists,
          [clientId]: (prev.shoppingLists[clientId] || []).map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        },
      }));
    },
    [activeClientId]
  );

  const deleteShopping = useCallback(
    (id, clientId = activeClientId) => {
      if (!clientId) return;

      setState((prev) => ({
        ...prev,
        shoppingLists: {
          ...prev.shoppingLists,
          [clientId]: (prev.shoppingLists[clientId] || []).filter((item) => item.id !== id),
        },
      }));
    },
    [activeClientId]
  );

  const toggleChallenge = useCallback(
    (challenge, clientId = activeClientId) => {
      if (!clientId) return;

      setState((prev) => {
        const current = prev.challenges[clientId] || { completed: [], current: [] };
        const isDone = current.completed.includes(challenge);

        return {
          ...prev,
          challenges: {
            ...prev.challenges,
            [clientId]: {
              ...current,
              completed: isDone
                ? current.completed.filter((item) => item !== challenge)
                : [...current.completed, challenge],
            },
          },
        };
      });
    },
    [activeClientId]
  );

  const value = useMemo(
    () => ({
      ready,
      state,
      session,
      activeClientId,
      activeClient,
      inventory,
      shoppingList,
      challengeState,
      pendingCount,
      demoInventory,
      demoShoppingList,
      demoChallenges,
      adminSelectedClientId,
      setAdminSelectedClientId,
      login,
      register,
      logout,
      addInventory,
      deleteInventory,
      addShopping,
      toggleShopping,
      deleteShopping,
      toggleChallenge,
    }),
    [
      ready,
      state,
      session,
      activeClientId,
      activeClient,
      inventory,
      shoppingList,
      challengeState,
      pendingCount,
      demoInventory,
      demoShoppingList,
      demoChallenges,
      adminSelectedClientId,
      login,
      register,
      logout,
      addInventory,
      deleteInventory,
      addShopping,
      toggleShopping,
      deleteShopping,
      toggleChallenge,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error('useAppStore deve ser usado dentro de AppStoreProvider.');
  }

  return context;
}