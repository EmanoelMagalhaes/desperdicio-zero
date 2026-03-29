import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { createId } from '../utils/ids';
import { assertFirebaseReady, db } from './firebaseClient';

function mapAds(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function subscribeAds(onChange, onError, options = {}) {
  assertFirebaseReady();

  const scope = options.scope || 'public';
  const base = collection(db, 'ads');
  const adsQuery = scope === 'admin' ? base : query(base, where('status', '==', 'approved'));

  return onSnapshot(
    adsQuery,
    (snapshot) => {
      onChange(mapAds(snapshot));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createAd(ad) {
  assertFirebaseReady();

  const id = ad.id || createId('ad');
  const payload = {
    ...ad,
    id,
    status: ad.status || 'pending',
    isActive: Boolean(ad.isActive),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'ads', id), payload, { merge: true });
  return payload;
}

export async function updateAd(adId, updates) {
  assertFirebaseReady();

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'ads', adId), payload, { merge: true });
  return payload;
}
