import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { assertFirebaseReady, db } from './firebaseClient';

function mapOrders(snapshot) {
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

export function subscribeOrdersByConsumer(consumerId, onChange, onError) {
  assertFirebaseReady();

  if (!consumerId) {
    onChange([]);
    return () => {};
  }

  const ordersQuery = query(collection(db, 'orders'), where('consumerId', '==', consumerId));

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onChange(mapOrders(snapshot));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createOrder(order) {
  assertFirebaseReady();

  const payload = {
    ...order,
    status: order.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: [
      ...(order.timeline || []),
      {
        status: order.status || 'pending',
        at: serverTimestamp(),
      },
    ],
  };

  const docRef = await addDoc(collection(db, 'orders'), payload);
  return { id: docRef.id, ...payload };
}
