import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON nao configurado no ambiente do backend.');
  }

  const normalizedRaw = raw.trim();
  const json = normalizedRaw.startsWith('{')
    ? normalizedRaw
    : Buffer.from(normalizedRaw, 'base64').toString('utf8');

  const parsed = JSON.parse(json);
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  return parsed;
}

const serviceAccount = parseServiceAccount();

const adminApp =
  getApps()[0] ||
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const serverTimestamp = () => FieldValue.serverTimestamp();
