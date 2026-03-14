import { collection, onSnapshot, query, where } from 'firebase/firestore';
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
