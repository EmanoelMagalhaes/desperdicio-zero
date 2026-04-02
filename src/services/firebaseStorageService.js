import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { assertFirebaseReady, storage } from './firebaseClient';

export async function uploadOfferImage({ file, restaurantId, offerId }) {
  assertFirebaseReady();
  if (!storage) {
    throw new Error('Firebase Storage nao configurado.');
  }
  if (!file || !restaurantId || !offerId) {
    throw new Error('Dados insuficientes para upload da imagem.');
  }

  const safeName = file.name.replace(/[^a-z0-9_.-]/gi, '-').toLowerCase();
  const path = `offers/${restaurantId}/${offerId}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file, { contentType: file.type || 'image/jpeg' });
  return await getDownloadURL(fileRef);
}
