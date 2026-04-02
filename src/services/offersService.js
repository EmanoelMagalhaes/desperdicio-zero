import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { createId } from '../utils/ids';
import { assertFirebaseReady, db } from './firebaseClient';

function mapOffers(snapshot) {
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

export function subscribeOffers(onChange, onError, options = {}) {
  assertFirebaseReady();

  const { includeInactive = false } = options;
  const baseQuery = includeInactive
    ? collection(db, 'offers')
    : query(collection(db, 'offers'), where('isActive', '==', true));

  return onSnapshot(
    baseQuery,
    (snapshot) => {
      onChange(mapOffers(snapshot));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createOffer(offer) {
  assertFirebaseReady();

  const id = offer.id || createId('offer');
  const payload = {
    ...offer,
    id,
    isActive: offer.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'offers', id), payload, { merge: true });
  return payload;
}

export async function updateOffer(offerId, updates) {
  assertFirebaseReady();

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'offers', offerId), payload, { merge: true });
  return payload;
}

export async function deleteOffer(offerId) {
  assertFirebaseReady();
  await deleteDoc(doc(db, 'offers', offerId));
}

export async function updateOffersRestaurantName(restaurantId, restaurantName) {
  assertFirebaseReady();
  if (!restaurantId || !restaurantName) return { ok: false, error: 'Dados invalidos.' };

  const offersQuery = query(collection(db, 'offers'), where('restaurantId', '==', restaurantId));
  const snapshot = await getDocs(offersQuery);

  if (snapshot.empty) return { ok: true, updated: 0 };

  const updates = snapshot.docs.map((docItem) =>
    setDoc(
      doc(db, 'offers', docItem.id),
      { restaurantName, updatedAt: serverTimestamp() },
      { merge: true }
    )
  );

  await Promise.all(updates);
  return { ok: true, updated: snapshot.size };
}
