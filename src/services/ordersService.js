import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { assertFirebaseReady, db } from './firebaseClient';

function mapOrders(snapshot) {
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

export function subscribeAllOrders(onChange, onError) {
  assertFirebaseReady();

  const ordersQuery = query(collection(db, 'orders'));

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

export function subscribeOrdersByRestaurant(restaurantId, onChange, onError) {
  assertFirebaseReady();

  if (!restaurantId) {
    onChange([]);
    return () => {};
  }

  const ordersQuery = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));

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

  const baseTimeline = Array.isArray(order.timeline) && order.timeline.length
    ? order.timeline
    : [
      {
        status: order.status || 'pending',
        at: new Date().toISOString(),
      },
    ];

  const payload = {
    ...order,
    status: order.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: baseTimeline,
  };

  const docRef = await addDoc(collection(db, 'orders'), payload);
  return { id: docRef.id, ...payload };
}

export async function updateOrderStatus(orderId, payload = {}) {
  assertFirebaseReady();

  if (!orderId) {
    throw new Error('Pedido invalido.');
  }

  const nextStatus = payload.status;
  const nextTimeline = Array.isArray(payload.timeline) ? payload.timeline : [
    {
      status: nextStatus,
      at: new Date().toISOString(),
    },
  ];

  await updateDoc(doc(db, 'orders', orderId), {
    status: nextStatus,
    updatedAt: serverTimestamp(),
    timeline: nextTimeline,
  });
}
