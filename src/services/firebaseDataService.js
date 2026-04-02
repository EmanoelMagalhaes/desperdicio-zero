import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { createId } from '../utils/ids';
import { assertFirebaseReady, db } from './firebaseClient';

const defaultChallengeState = {
  completed: [],
  current: [
    'Cadastrar os primeiros itens do estoque',
    'Montar a primeira lista de compras',
    'Revisar itens com validade mais proxima',
  ],
};

function userDocRef(uid) {
  return doc(db, 'users', uid);
}

function clientDocRef(clientId) {
  return doc(db, 'clients', clientId);
}

function inventoryCollection(clientId) {
  return collection(db, 'clients', clientId, 'inventory');
}

function shoppingCollection(clientId) {
  return collection(db, 'clients', clientId, 'shopping');
}

function challengesDocRef(clientId) {
  return doc(db, 'clients', clientId, 'meta', 'challenges');
}

function cmsPublicDocRef() {
  return doc(db, 'cms', 'public');
}

function normalizeChallenges(raw) {
  if (!raw) return { ...defaultChallengeState };

  return {
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    current: Array.isArray(raw.current) && raw.current.length ? raw.current : defaultChallengeState.current,
  };
}

function mapClientProfile(snapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    role: 'client',
    name: data.name || data.email || 'Cliente',
    email: data.email || '',
    businessType: data.businessType || 'Operacao',
    approvalStatus: data.approvalStatus || 'approved',
  };
}

function mapCollection(snapshot) {
  return snapshot.docs.map((item) => {
    const data = item.data() || {};
    return { id: item.id, ...data };
  });
}

export async function ensureClientData(clientId) {
  assertFirebaseReady();

  await setDoc(clientDocRef(clientId), { updatedAt: serverTimestamp() }, { merge: true });

  const challengesSnapshot = await getDoc(challengesDocRef(clientId));
  if (!challengesSnapshot.exists()) {
    await setDoc(challengesDocRef(clientId), defaultChallengeState, { merge: true });
  }
}

export async function loadClientData(clientId) {
  assertFirebaseReady();
  await ensureClientData(clientId);

  const [inventorySnapshot, shoppingSnapshot, challengesSnapshot] = await Promise.all([
    getDocs(inventoryCollection(clientId)),
    getDocs(shoppingCollection(clientId)),
    getDoc(challengesDocRef(clientId)),
  ]);

  return {
    inventory: mapCollection(inventorySnapshot),
    shoppingList: mapCollection(shoppingSnapshot),
    challenges: normalizeChallenges(challengesSnapshot.exists() ? challengesSnapshot.data() : null),
  };
}

export function subscribeClientAccounts(onChange) {
  assertFirebaseReady();

  const clientsQuery = query(collection(db, 'users'), where('role', '==', 'client'));

  return onSnapshot(clientsQuery, (snapshot) => {
    const clients = snapshot.docs.map(mapClientProfile).sort((a, b) => {
      if (a.approvalStatus !== b.approvalStatus) {
        if (a.approvalStatus === 'pending') return -1;
        if (b.approvalStatus === 'pending') return 1;
      }

      return a.name.localeCompare(b.name);
    });

    onChange(clients);
  });
}

export function subscribeClientData(clientId, onChange) {
  assertFirebaseReady();

  const cache = {
    inventory: [],
    shoppingList: [],
    challenges: { ...defaultChallengeState },
  };

  ensureClientData(clientId).catch(() => null);

  const unsubscribeInventory = onSnapshot(inventoryCollection(clientId), (snapshot) => {
    cache.inventory = mapCollection(snapshot);
    onChange({ ...cache });
  });

  const unsubscribeShopping = onSnapshot(shoppingCollection(clientId), (snapshot) => {
    cache.shoppingList = mapCollection(snapshot);
    onChange({ ...cache });
  });

  const unsubscribeChallenges = onSnapshot(challengesDocRef(clientId), (snapshot) => {
    cache.challenges = normalizeChallenges(snapshot.exists() ? snapshot.data() : null);
    onChange({ ...cache });
  });

  return () => {
    unsubscribeInventory();
    unsubscribeShopping();
    unsubscribeChallenges();
  };
}

export async function updateClientApprovalStatus(clientId, approvalStatus, adminId) {
  assertFirebaseReady();

  await setDoc(
    userDocRef(clientId),
    {
      approvalStatus,
      approvedBy: adminId || null,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function addInventoryItem(clientId, item) {
  assertFirebaseReady();

  const payload = {
    ...item,
    id: item.id || createId('item'),
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(inventoryCollection(clientId), payload.id), payload, { merge: true });
  return payload;
}

export async function deleteInventoryItem(clientId, itemId) {
  assertFirebaseReady();
  await deleteDoc(doc(inventoryCollection(clientId), itemId));
}

export async function addShoppingItem(clientId, item) {
  assertFirebaseReady();

  const payload = {
    ...item,
    id: item.id || createId('shop'),
    checked: Boolean(item.checked),
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(shoppingCollection(clientId), payload.id), payload, { merge: true });
  return payload;
}

export async function toggleShoppingItem(clientId, itemId) {
  assertFirebaseReady();

  const itemRef = doc(shoppingCollection(clientId), itemId);
  const snapshot = await getDoc(itemRef);
  if (!snapshot.exists()) return;

  const current = snapshot.data() || {};
  await updateDoc(itemRef, { checked: !Boolean(current.checked), updatedAt: serverTimestamp() });
}

export async function deleteShoppingItem(clientId, itemId) {
  assertFirebaseReady();
  await deleteDoc(doc(shoppingCollection(clientId), itemId));
}

export async function toggleChallengeItem(clientId, challenge) {
  assertFirebaseReady();

  await ensureClientData(clientId);
  const challengeRef = challengesDocRef(clientId);
  const snapshot = await getDoc(challengeRef);
  const current = normalizeChallenges(snapshot.exists() ? snapshot.data() : null);

  const exists = current.completed.includes(challenge);
  const completed = exists
    ? current.completed.filter((item) => item !== challenge)
    : [...current.completed, challenge];

  const next = {
    ...current,
    completed,
    updatedAt: serverTimestamp(),
  };

  await setDoc(challengeRef, next, { merge: true });

  return {
    completed,
    current: current.current,
  };
}

export async function getUserProfile(uid) {
  assertFirebaseReady();
  const snapshot = await getDoc(userDocRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}

export async function updateUserAddress(uid, address) {
  assertFirebaseReady();
  if (!uid) return { ok: false, error: 'Usuario invalido.' };
  if (!address) return { ok: false, error: 'Endereco invalido.' };

  await updateDoc(userDocRef(uid), {
    address,
    updatedAt: serverTimestamp(),
  });

  return { ok: true };
}

export async function updateUserProfile(uid, payload) {
  assertFirebaseReady();
  if (!uid) return { ok: false, error: 'Usuario invalido.' };

  const updates = {};
  if (typeof payload?.name === 'string') updates.name = payload.name.trim();
  if (typeof payload?.phone === 'string') updates.phone = payload.phone;
  if (typeof payload?.address === 'string') updates.address = payload.address.trim();
  if (typeof payload?.businessType === 'string') updates.businessType = payload.businessType;

  if (!Object.keys(updates).length) {
    return { ok: false, error: 'Nenhuma alteracao encontrada.' };
  }

  updates.updatedAt = serverTimestamp();

  await updateDoc(userDocRef(uid), updates);
  return { ok: true };
}

export function subscribePublicCms(onChange, onError) {
  assertFirebaseReady();

  return onSnapshot(
    cmsPublicDocRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange(snapshot.data() || null);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function savePublicCms(payload) {
  assertFirebaseReady();
  await setDoc(
    cmsPublicDocRef(),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return { ok: true };
}

