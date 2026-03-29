import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createId } from '../utils/ids';
import { assertFirebaseReady, db } from './firebaseClient';

export async function createSubscription(payload) {
  assertFirebaseReady();

  const id = payload.id || createId('sub');
  const record = {
    ...payload,
    id,
    status: payload.status || 'pending',
    provider: payload.provider || 'mercadopago',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'subscriptions', id), record, { merge: true });
  return record;
}
