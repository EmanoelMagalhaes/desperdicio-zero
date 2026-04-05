import { adminDb, serverTimestamp } from './firebaseAdmin.js';
import {
  getPlanById,
  hasPantryUnlimitedEntitlement,
  normalizeInternalStatus,
  resolvePlanIdFromProviderPlanId,
} from './subscriptionModel.js';

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizeFirestoreDoc(snapshot) {
  const data = snapshot.data() || {};
  const normalized = { id: snapshot.id, ...data };

  ['createdAt', 'updatedAt', 'activatedAt', 'cancelledAt', 'lastReconciledAt'].forEach((key) => {
    const value = normalized[key];
    if (value && typeof value.toDate === 'function') {
      normalized[key] = value.toDate().toISOString();
    }
  });

  return normalized;
}

async function findSubscriptionByProviderId(providerSubscriptionId) {
  if (!providerSubscriptionId) return null;
  const snapshot = await adminDb
    .collection('subscriptions')
    .where('providerSubscriptionId', '==', providerSubscriptionId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0];
}

async function findSubscriptionByExternalReference(externalReference) {
  if (!externalReference) return null;
  const ref = adminDb.collection('subscriptions').doc(externalReference);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;
  return snapshot;
}

async function findUserByEmail(email) {
  if (!email) return null;
  const snapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0];
}

async function findLatestSubscriptionByUser(userId) {
  if (!userId) return null;
  const snapshot = await adminDb.collection('subscriptions').where('userId', '==', userId).get();
  if (snapshot.empty) return null;

  return snapshot.docs
    .slice()
    .sort((a, b) => {
      const aMillis = timestampToMillis(a.data()?.updatedAt);
      const bMillis = timestampToMillis(b.data()?.updatedAt);
      return bMillis - aMillis;
    })[0];
}

function resolvePreapprovalEmail(preapproval) {
  return normalizeEmail(preapproval?.payer_email || preapproval?.payer?.email || '');
}

function cleanObject(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export async function syncSubscriptionFromPreapproval({
  preapproval,
  source,
  eventId = '',
  forcedSubscriptionId = '',
  fallbackUserId = '',
  fallbackUserEmail = '',
  fallbackUserRole = '',
}) {
  const providerSubscriptionId = String(preapproval?.id || '').trim();
  if (!providerSubscriptionId) {
    throw new Error('Resposta do Mercado Pago sem ID de assinatura.');
  }

  const externalReference = String(preapproval?.external_reference || '').trim();
  const providerPlanId = String(preapproval?.preapproval_plan_id || '').trim();
  const providerStatus = String(preapproval?.status || '').trim().toLowerCase();
  const status = normalizeInternalStatus(providerStatus);

  let subscriptionSnapshot = null;

  if (forcedSubscriptionId) {
    const forcedRef = adminDb.collection('subscriptions').doc(forcedSubscriptionId);
    const forcedSnapshot = await forcedRef.get();
    if (forcedSnapshot.exists) {
      subscriptionSnapshot = forcedSnapshot;
    }
  }

  if (!subscriptionSnapshot && externalReference) {
    subscriptionSnapshot = await findSubscriptionByExternalReference(externalReference);
  }

  if (!subscriptionSnapshot) {
    subscriptionSnapshot = await findSubscriptionByProviderId(providerSubscriptionId);
  }

  const existing = subscriptionSnapshot ? subscriptionSnapshot.data() || {} : {};
  let userId = existing.userId || fallbackUserId || '';
  let userEmail = normalizeEmail(existing.userEmail || fallbackUserEmail || resolvePreapprovalEmail(preapproval));
  let userRole = existing.userRole || fallbackUserRole || '';

  if (!userId && userEmail) {
    const userSnapshot = await findUserByEmail(userEmail);
    if (userSnapshot) {
      const profile = userSnapshot.data() || {};
      userId = userSnapshot.id;
      userRole = userRole || profile.role || '';
      userEmail = userEmail || normalizeEmail(profile.email);
    }
  }

  if (!subscriptionSnapshot && userId) {
    subscriptionSnapshot = await findLatestSubscriptionByUser(userId);
  }

  const docId =
    forcedSubscriptionId ||
    subscriptionSnapshot?.id ||
    externalReference ||
    `sub-mp-${providerSubscriptionId}`;

  const nextPlanId = resolvePlanIdFromProviderPlanId(providerPlanId) || existing.planId || '';
  const nextPlan = getPlanById(nextPlanId);

  const pantryUnlimited = hasPantryUnlimitedEntitlement({
    planId: nextPlanId,
    userRole,
    status,
  });

  const transactionAmount = Number(preapproval?.auto_recurring?.transaction_amount || existing.price || 0);
  const currency = preapproval?.auto_recurring?.currency_id || existing.currency || 'BRL';

  const payload = cleanObject({
    id: docId,
    provider: 'mercadopago',
    providerSubscriptionId,
    providerPlanId,
    providerStatus,
    status,
    externalReference: externalReference || docId,
    userId: userId || existing.userId || '',
    userEmail: userEmail || existing.userEmail || '',
    userRole: userRole || existing.userRole || '',
    planId: nextPlanId,
    planName: nextPlan?.name || existing.planName || '',
    price: transactionAmount,
    currency,
    billingPeriod: existing.billingPeriod || nextPlan?.billingPeriod || 'mensal',
    entitlements: {
      pantryUnlimited,
    },
    lastSource: source || 'reconcile',
    lastEventId: eventId || existing.lastEventId || '',
    lastReconciledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (status === 'active' && !existing.activatedAt) {
    payload.activatedAt = serverTimestamp();
  }

  if ((status === 'cancelled' || status === 'expired' || status === 'rejected') && !existing.cancelledAt) {
    payload.cancelledAt = serverTimestamp();
  }

  if (!existing.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  const targetRef = adminDb.collection('subscriptions').doc(docId);
  await targetRef.set(payload, { merge: true });
  const updatedSnapshot = await targetRef.get();

  return {
    subscriptionId: docId,
    subscription: normalizeFirestoreDoc(updatedSnapshot),
  };
}
