import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEY, defaultState } from '../data/defaultState';
import {
  createClientAccountByAdmin,
  loginWithMode,
  registerClientAccount,
  registerConsumerAccount,
} from '../services/authService';
import {
  createClientByAdminWithFirebase,
  loginWithFirebase,
  logoutFirebase,
  registerClientWithFirebase,
  registerConsumerWithFirebase,
  sendPasswordResetWithFirebase,
  subscribeAuthSession,
} from '../services/firebaseAuthService';
import {
  addInventoryItem,
  addShoppingItem,
  deleteInventoryItem,
  deleteShoppingItem,
  loadClientData,
  subscribeClientAccounts,
  subscribeClientData,
  updateClientApprovalStatus,
  toggleChallengeItem,
  toggleShoppingItem,
} from '../services/firebaseDataService';
import { backendAdapter } from '../services/backendAdapter';
import { loadState, persistState } from '../services/storageService';
import { createOffer, deleteOffer, subscribeOffers, updateOffer } from '../services/offersService';
import { createOrder as createOrderRemote, subscribeOrdersByConsumer } from '../services/ordersService';
import { daysUntil } from '../utils/date';
import { downloadJson } from '../utils/export';
import { createId } from '../utils/ids';
import { getPermissionsForRole } from '../modules/rbac/rbac';

const AppStoreContext = createContext(null);

function upsertClientAccount(accounts, account) {
  if (!account || account.role !== 'client') return accounts;

  const exists = accounts.some((item) => item.id === account.id);
  if (exists) {
    return accounts.map((item) => (item.id === account.id ? { ...item, ...account } : item));
  }

  return [...accounts, account];
}

function createEmptyOperationalState() {
  return {
    clientAccounts: [],
    adminAccounts: [],
    consumerAccounts: [],
    inventories: {},
    shoppingLists: {},
    challenges: {},
    offers: [],
    orders: [],
  };
}

function upsertOffer(list, offer) {
  const index = list.findIndex((item) => item.id === offer.id);
  if (index === -1) return [...list, offer];

  const next = [...list];
  next[index] = { ...next[index], ...offer };
  return next;
}

export function AppStoreProvider({ children }) {
  const firebaseMode = backendAdapter.isFirebase();

  const [state, setState] = useState(defaultState);
  const [session, setSession] = useState(null);
  const [adminSelectedClientId, setAdminSelectedClientId] = useState('');
  const [offersStatus, setOffersStatus] = useState('idle');
  const [offersError, setOffersError] = useState('');
  const [ordersStatus, setOrdersStatus] = useState('idle');
  const [ordersError, setOrdersError] = useState('');
  const [cart, setCart] = useState({ restaurantId: '', restaurantName: '', items: [] });
  const [cartWarning, setCartWarning] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (firebaseMode) {
      setState((prev) => ({ ...prev, ...createEmptyOperationalState() }));
      setReady(true);
      return;
    }

    const loaded = loadState(STORAGE_KEY, defaultState);
    setState(loaded);
    setAdminSelectedClientId('cliente-demo');
    setReady(true);
  }, [firebaseMode]);

  useEffect(() => {
    if (!ready || firebaseMode) return;
    persistState(STORAGE_KEY, state);
  }, [ready, state, firebaseMode]);

  useEffect(() => {
    if (!firebaseMode) return;

    const unsubscribe = subscribeAuthSession((account) => {
      if (!account) {
        setSession(null);
        setState((prev) => ({ ...prev, ...createEmptyOperationalState() }));
        setAdminSelectedClientId('');
        return;
      }

      setSession(account);
      if (account.role === 'client') {
        setState((prev) => ({
          ...prev,
          clientAccounts: upsertClientAccount(prev.clientAccounts, account),
        }));
      }
    });

    return unsubscribe;
  }, [firebaseMode]);

  useEffect(() => {
    if (!firebaseMode || session?.role !== 'client') return;

    const clientId = session.id;
    const unsubscribe = subscribeClientData(clientId, (data) => {
      setState((prev) => ({
        ...prev,
        clientAccounts: upsertClientAccount(prev.clientAccounts, session),
        inventories: { ...prev.inventories, [clientId]: data.inventory },
        shoppingLists: { ...prev.shoppingLists, [clientId]: data.shoppingList },
        challenges: { ...prev.challenges, [clientId]: data.challenges },
      }));
    });

    return unsubscribe;
  }, [firebaseMode, session]);

  useEffect(() => {
    if (!firebaseMode || session?.role !== 'admin') return;

    let active = true;

    const unsubscribe = subscribeClientAccounts(async (clients) => {
      if (!active) return;

      setState((prev) => ({ ...prev, clientAccounts: clients }));
      setAdminSelectedClientId((prev) => {
        if (prev && clients.some((client) => client.id === prev)) return prev;
        return clients[0]?.id || '';
      });

      const loaded = await Promise.all(
        clients.map(async (client) => ({
          id: client.id,
          data: await loadClientData(client.id),
        }))
      );

      if (!active) return;

      setState((prev) => {
        const inventories = { ...prev.inventories };
        const shoppingLists = { ...prev.shoppingLists };
        const challenges = { ...prev.challenges };

        loaded.forEach(({ id, data }) => {
          inventories[id] = data.inventory;
          shoppingLists[id] = data.shoppingList;
          challenges[id] = data.challenges;
        });

        return {
          ...prev,
          inventories,
          shoppingLists,
          challenges,
        };
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [firebaseMode, session?.role]);

  useEffect(() => {
    if (!firebaseMode || session?.role !== 'admin' || !adminSelectedClientId) return;

    const unsubscribe = subscribeClientData(adminSelectedClientId, (data) => {
      setState((prev) => ({
        ...prev,
        inventories: { ...prev.inventories, [adminSelectedClientId]: data.inventory },
        shoppingLists: { ...prev.shoppingLists, [adminSelectedClientId]: data.shoppingList },
        challenges: { ...prev.challenges, [adminSelectedClientId]: data.challenges },
      }));
    });

    return unsubscribe;
  }, [firebaseMode, session?.role, adminSelectedClientId]);

  useEffect(() => {
    if (session?.role !== 'admin') return;

    const exists = state.clientAccounts.some((client) => client.id === adminSelectedClientId);
    if (!exists) {
      setAdminSelectedClientId(state.clientAccounts[0]?.id || '');
    }
  }, [session, state.clientAccounts, adminSelectedClientId]);

  useEffect(() => {
    if (!firebaseMode) {
      setOffersStatus('ready');
      setOffersError('');
      return;
    }

    setOffersStatus('loading');
    const unsubscribe = subscribeOffers(
      (items) => {
        setState((prev) => ({ ...prev, offers: items }));
        setOffersStatus('ready');
        setOffersError('');
      },
      () => {
        setOffersStatus('error');
        setOffersError('Nao foi possivel carregar ofertas no Firebase.');
      }
    );

    return unsubscribe;
  }, [firebaseMode]);

  useEffect(() => {
    if (!firebaseMode || session?.role !== 'consumer') {
      if (!firebaseMode) {
        setOrdersStatus('ready');
        setOrdersError('');
      }
      return;
    }

    setOrdersStatus('loading');
    const unsubscribe = subscribeOrdersByConsumer(
      session.id,
      (items) => {
        setState((prev) => ({ ...prev, orders: items }));
        setOrdersStatus('ready');
        setOrdersError('');
      },
      () => {
        setOrdersStatus('error');
        setOrdersError('Nao foi possivel carregar pedidos no Firebase.');
      }
    );

    return unsubscribe;
  }, [firebaseMode, session?.role, session?.id]);

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

  const offers = useMemo(() => state.offers || [], [state.offers]);
  const orders = useMemo(() => state.orders || [], [state.orders]);
  const consumerOrders = useMemo(() => {
    if (!session?.id) return [];
    return orders.filter((order) => order.consumerId === session.id);
  }, [orders, session?.id]);
  const restaurantOffers = useMemo(() => {
    if (!session) return [];
    const restaurantId = session.role === 'admin' ? activeClientId : session.id;
    if (!restaurantId) return [];
    return offers.filter((offer) => offer.restaurantId === restaurantId);
  }, [offers, session, activeClientId]);
  const cartTotal = useMemo(
    () => cart.items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0),
    [cart.items]
  );

  const demoInventory = defaultState.inventories['cliente-demo'] || [];
  const demoShoppingList = defaultState.shoppingLists['cliente-demo'] || [];
  const demoChallenges = defaultState.challenges['cliente-demo'] || { completed: [], current: [] };

  const pendingCount = useMemo(() => {
    if (!session) return 0;

    if (session.role === 'client') {
      return inventory.filter((item) => daysUntil(item.expiry) <= 2).length;
    }

    return Object.values(state.inventories)
      .flat()
      .filter((item) => daysUntil(item.expiry) <= 2).length;
  }, [session, state.inventories, inventory]);

  const sessionPermissions = useMemo(() => getPermissionsForRole(session?.role), [session]);

  const login = useCallback(
    async (mode, email, password) => {
      if (firebaseMode) {
        const result = await loginWithFirebase(mode, email, password);
        if (!result.ok) return result;

        setSession(result.account);

        if (result.account.role === 'admin') {
          setAdminSelectedClientId((prev) => prev || state.clientAccounts[0]?.id || '');
        }

        return result;
      }

      const result = loginWithMode(state, mode, email, password);
      if (!result.ok) return result;

      setSession(result.account);
      if (result.account.role === 'admin') {
        setAdminSelectedClientId(state.clientAccounts[0]?.id || '');
      }

      return { ok: true, account: result.account };
    },
    [firebaseMode, state]
  );

  const register = useCallback(
    async (form) => {
      if (firebaseMode) {
        return registerClientWithFirebase(form);
      }

      const result = registerClientAccount(state, form);
      if (!result.ok) return result;

      setState(result.nextState);
      return result;
    },
    [firebaseMode, state]
  );

  const registerConsumer = useCallback(
    async (form) => {
      if (firebaseMode) {
        return registerConsumerWithFirebase(form);
      }

      const result = registerConsumerAccount(state, form);
      if (!result.ok) return result;

      setState(result.nextState);
      return {
        ok: true,
        message: 'Cadastro criado. Agora voce ja pode entrar como consumidor.',
      };
    },
    [firebaseMode, state]
  );

  const clearCart = useCallback(() => {
    setCart({ restaurantId: '', restaurantName: '', items: [] });
    setCartWarning('');
  }, []);

  const addToCart = useCallback(
    (offer) => {
      if (!offer) return { ok: false, error: 'Oferta invalida.' };

      if (cart.restaurantId && cart.restaurantId !== offer.restaurantId) {
        setCartWarning(
          'Seu carrinho possui itens de outro restaurante. Limpe o carrinho para trocar de restaurante.'
        );
        return { ok: false, requiresConfirm: true };
      }

      setCartWarning('');
      setCart((prev) => {
        const existing = prev.items.find((item) => item.offerId === offer.id);
        const nextItems = existing
          ? prev.items.map((item) =>
              item.offerId === offer.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    subtotal: (item.quantity + 1) * item.unitPrice,
                  }
                : item
            )
          : [
              ...prev.items,
              {
                offerId: offer.id,
                title: offer.title,
                quantity: 1,
                unitPrice: Number(offer.price || 0),
                subtotal: Number(offer.price || 0),
              },
            ];

        return {
          restaurantId: offer.restaurantId,
          restaurantName: offer.restaurantName,
          items: nextItems,
        };
      });

      return { ok: true };
    },
    [cart.restaurantId]
  );

  const replaceCartWithOffer = useCallback((offer) => {
    if (!offer) return { ok: false, error: 'Oferta invalida.' };

    setCartWarning('');
    setCart({
      restaurantId: offer.restaurantId,
      restaurantName: offer.restaurantName,
      items: [
        {
          offerId: offer.id,
          title: offer.title,
          quantity: 1,
          unitPrice: Number(offer.price || 0),
          subtotal: Number(offer.price || 0),
        },
      ],
    });

    return { ok: true };
  }, []);

  const updateCartItem = useCallback((offerId, nextQuantity) => {
    setCart((prev) => {
      const items = prev.items
        .map((item) => {
          if (item.offerId !== offerId) return item;
          const quantity = Math.max(1, nextQuantity);
          return { ...item, quantity, subtotal: quantity * item.unitPrice };
        })
        .filter((item) => item.quantity > 0);

      if (!items.length) {
        return { restaurantId: '', restaurantName: '', items: [] };
      }

      return { ...prev, items };
    });
  }, []);

  const removeFromCart = useCallback((offerId) => {
    setCart((prev) => {
      const items = prev.items.filter((item) => item.offerId !== offerId);
      if (!items.length) {
        return { restaurantId: '', restaurantName: '', items: [] };
      }
      return { ...prev, items };
    });
  }, []);

  const createOrder = useCallback(
    async (payload) => {
      if (!cart.items.length) {
        return { ok: false, error: 'Seu carrinho esta vazio.' };
      }

      const restaurantId = cart.restaurantId;
      if (!restaurantId) {
        return { ok: false, error: 'Restaurante nao identificado.' };
      }

      const isGuest = !(session && session.role === 'consumer');
      const consumerId = session?.role === 'consumer' ? session.id : createId('guest');

      const orderPayload = {
        restaurantId,
        restaurantName: cart.restaurantName,
        consumerId,
        consumerIsGuest: Boolean(isGuest),
        consumerName: payload.consumerName,
        consumerEmail: payload.consumerEmail,
        consumerPhone: payload.consumerPhone,
        receivingMethod: payload.receivingMethod,
        deliveryAddress: payload.deliveryAddress || '',
        paymentMethod: payload.paymentMethod,
        notes: payload.notes || '',
        items: cart.items,
        total: cartTotal,
        status: 'pending',
        timeline: [
          {
            status: 'pending',
            at: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        let createdOrder = orderPayload;
        if (firebaseMode) {
          const remoteOrder = await createOrderRemote(orderPayload);
          createdOrder = { ...orderPayload, id: remoteOrder.id };
        }

        setState((prev) => ({
          ...prev,
          orders: [...(prev.orders || []), createdOrder],
        }));

        clearCart();
        return { ok: true, order: createdOrder };
      } catch (error) {
        return { ok: false, error: error?.message || 'Nao foi possivel enviar o pedido.' };
      }
    },
    [cart, cartTotal, session, firebaseMode, clearCart]
  );

  const createRestaurantOffer = useCallback(
    async (payload) => {
      if (!session) return { ok: false, error: 'Sessao invalida.' };

      const restaurantId = session.role === 'admin' ? activeClientId : session.id;
      if (!restaurantId) return { ok: false, error: 'Restaurante nao identificado.' };

      const basePayload = {
        ...payload,
        restaurantId,
        restaurantName: payload.restaurantName || activeClient?.name || session.name || 'Restaurante',
        isActive: payload.isActive !== false,
      };

      try {
        if (firebaseMode) {
          const created = await createOffer(basePayload);
          setState((prev) => ({
            ...prev,
            offers: upsertOffer(prev.offers || [], created),
          }));
          return { ok: true, offer: created };
        }

        const created = {
          ...basePayload,
          id: payload.id || createId('offer'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setState((prev) => ({
          ...prev,
          offers: upsertOffer(prev.offers || [], created),
        }));
        return { ok: true, offer: created };
      } catch (error) {
        return { ok: false, error: error?.message || 'Nao foi possivel criar a oferta.' };
      }
    },
    [session, activeClientId, activeClient, firebaseMode]
  );

  const updateRestaurantOffer = useCallback(
    async (offerId, updates) => {
      if (!offerId) return { ok: false, error: 'Oferta invalida.' };

      try {
        if (firebaseMode) {
          const payload = await updateOffer(offerId, updates);
          setState((prev) => ({
            ...prev,
            offers: upsertOffer(prev.offers || [], { id: offerId, ...payload }),
          }));
          return { ok: true };
        }

        setState((prev) => ({
          ...prev,
          offers: (prev.offers || []).map((offer) =>
            offer.id === offerId ? { ...offer, ...updates, updatedAt: new Date().toISOString() } : offer
          ),
        }));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error?.message || 'Nao foi possivel atualizar a oferta.' };
      }
    },
    [firebaseMode]
  );

  const deleteRestaurantOffer = useCallback(
    async (offerId) => {
      if (!offerId) return { ok: false, error: 'Oferta invalida.' };

      try {
        if (firebaseMode) {
          await deleteOffer(offerId);
        }

        setState((prev) => ({
          ...prev,
          offers: (prev.offers || []).filter((offer) => offer.id !== offerId),
        }));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error?.message || 'Nao foi possivel remover a oferta.' };
      }
    },
    [firebaseMode]
  );
  const requestPasswordReset = useCallback(
    async (email) => {
      if (!email) {
        return { ok: false, error: 'Informe o e-mail para recuperar a senha.' };
      }

      if (firebaseMode) {
        return sendPasswordResetWithFirebase(email);
      }

      return {
        ok: true,
        message:
          'No modo local nao ha envio real de e-mail. Em producao com Firebase, o link de redefinicao sera enviado para o endereco informado.',
      };
    },
    [firebaseMode]
  );
  const createClientByAdmin = useCallback(
    async (form) => {
      if (session?.role !== 'admin') {
        return { ok: false, error: 'Apenas administradores podem cadastrar clientes.' };
      }

      if (firebaseMode) {
        const result = await createClientByAdminWithFirebase(form, session);
        if (!result.ok) return result;

        setState((prev) => ({
          ...prev,
          clientAccounts: upsertClientAccount(prev.clientAccounts, result.account),
          inventories: {
            ...prev.inventories,
            [result.account.id]: prev.inventories[result.account.id] || [],
          },
          shoppingLists: {
            ...prev.shoppingLists,
            [result.account.id]: prev.shoppingLists[result.account.id] || [],
          },
          challenges: {
            ...prev.challenges,
            [result.account.id]: prev.challenges[result.account.id] || { completed: [], current: [] },
          },
        }));

        return result;
      }

      const result = createClientAccountByAdmin(state, form);
      if (!result.ok) return result;

      setState(result.nextState);

      return { ok: true, account: result.account };
    },
    [firebaseMode, session, state]
  );

  const setClientApproval = useCallback(
    async (clientId, approvalStatus) => {
      if (!clientId) {
        return { ok: false, error: 'Cliente invalido.' };
      }

      if (session?.role !== 'admin') {
        return { ok: false, error: 'Apenas administradores podem aprovar clientes.' };
      }

      if (firebaseMode) {
        await updateClientApprovalStatus(clientId, approvalStatus, session.id);
      }

      setState((prev) => ({
        ...prev,
        clientAccounts: prev.clientAccounts.map((client) =>
          client.id === clientId ? { ...client, approvalStatus } : client
        ),
      }));

      return { ok: true };
    },
    [firebaseMode, session]
  );

  const logout = useCallback(async () => {
    if (firebaseMode) {
      await logoutFirebase();
    }

    setSession(null);
  }, [firebaseMode]);

  const addInventory = useCallback(
    async (item, clientId = activeClientId) => {
      if (!clientId) return;

      const payload = { ...item, id: item.id || createId('item') };

      if (firebaseMode) {
        await addInventoryItem(clientId, payload);
      }

      setState((prev) => ({
        ...prev,
        inventories: {
          ...prev.inventories,
          [clientId]: [...(prev.inventories[clientId] || []), payload],
        },
      }));
    },
    [activeClientId, firebaseMode]
  );

  const deleteInventory = useCallback(
    async (id, clientId = activeClientId) => {
      if (!clientId) return;

      if (firebaseMode) {
        await deleteInventoryItem(clientId, id);
      }

      setState((prev) => ({
        ...prev,
        inventories: {
          ...prev.inventories,
          [clientId]: (prev.inventories[clientId] || []).filter((item) => item.id !== id),
        },
      }));
    },
    [activeClientId, firebaseMode]
  );

  const addShopping = useCallback(
    async (item, clientId = activeClientId) => {
      if (!clientId) return;

      const payload = { ...item, id: item.id || createId('shop'), checked: Boolean(item.checked) };

      if (firebaseMode) {
        await addShoppingItem(clientId, payload);
      }

      setState((prev) => ({
        ...prev,
        shoppingLists: {
          ...prev.shoppingLists,
          [clientId]: [...(prev.shoppingLists[clientId] || []), payload],
        },
      }));
    },
    [activeClientId, firebaseMode]
  );

  const toggleShopping = useCallback(
    async (id, clientId = activeClientId) => {
      if (!clientId) return;

      if (firebaseMode) {
        await toggleShoppingItem(clientId, id);
      }

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
    [activeClientId, firebaseMode]
  );

  const deleteShopping = useCallback(
    async (id, clientId = activeClientId) => {
      if (!clientId) return;

      if (firebaseMode) {
        await deleteShoppingItem(clientId, id);
      }

      setState((prev) => ({
        ...prev,
        shoppingLists: {
          ...prev.shoppingLists,
          [clientId]: (prev.shoppingLists[clientId] || []).filter((item) => item.id !== id),
        },
      }));
    },
    [activeClientId, firebaseMode]
  );

  const toggleChallenge = useCallback(
    async (challenge, clientId = activeClientId) => {
      if (!clientId) return;

      if (firebaseMode) {
        const nextChallenges = await toggleChallengeItem(clientId, challenge);

        setState((prev) => ({
          ...prev,
          challenges: {
            ...prev.challenges,
            [clientId]: nextChallenges,
          },
        }));

        return;
      }

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
    [activeClientId, firebaseMode]
  );

  const exportBackup = useCallback(() => {
    if (!session || !activeClientId) {
      return { ok: false, error: 'Nenhum cliente ativo para exportacao.' };
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      app: 'Desperdicio Zero',
      backendMode: firebaseMode ? 'firebase' : 'local',
      exportedBy: {
        id: session.id,
        role: session.role,
        email: session.email,
        name: session.name,
      },
      client: activeClient || {
        id: activeClientId,
        role: 'client',
      },
      data: {
        inventory: state.inventories[activeClientId] || [],
        shoppingList: state.shoppingLists[activeClientId] || [],
        challenges: state.challenges[activeClientId] || { completed: [], current: [] },
      },
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${activeClientId}-${stamp}.json`;

    downloadJson(fileName, payload);

    return { ok: true, fileName };
  }, [session, activeClientId, activeClient, firebaseMode, state]);

  const value = useMemo(
    () => ({
      ready,
      state,
      session,
      sessionPermissions,
      activeClientId,
      activeClient,
      inventory,
      shoppingList,
      challengeState,
      pendingCount,
      offers,
      offersStatus,
      offersError,
      consumerOrders,
      restaurantOffers,
      cart,
      cartTotal,
      cartWarning,
      ordersStatus,
      ordersError,
      demoInventory,
      demoShoppingList,
      demoChallenges,
      adminSelectedClientId,
      setAdminSelectedClientId,
      login,
      register,
      registerConsumer,
      requestPasswordReset,
      createClientByAdmin,
      createRestaurantOffer,
      updateRestaurantOffer,
      deleteRestaurantOffer,
      addToCart,
      replaceCartWithOffer,
      updateCartItem,
      removeFromCart,
      clearCart,
      createOrder,
      setClientApproval,
      logout,
      addInventory,
      deleteInventory,
      addShopping,
      toggleShopping,
      deleteShopping,
      toggleChallenge,
      exportBackup,
      backendMode: firebaseMode ? 'firebase' : 'local',
    }),
    [
      ready,
      state,
      session,
      sessionPermissions,
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
      registerConsumer,
      requestPasswordReset,
      createClientByAdmin,
      createRestaurantOffer,
      updateRestaurantOffer,
      deleteRestaurantOffer,
      setClientApproval,
      logout,
      addInventory,
      deleteInventory,
      addShopping,
      toggleShopping,
      deleteShopping,
      toggleChallenge,
      exportBackup,
      firebaseMode,
      offers,
      offersStatus,
      offersError,
      consumerOrders,
      restaurantOffers,
      cart,
      cartTotal,
      cartWarning,
      ordersStatus,
      ordersError,
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







