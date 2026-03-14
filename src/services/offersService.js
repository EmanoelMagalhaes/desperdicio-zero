import { collection, onSnapshot, query, where } from 'firebase/firestore';
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
