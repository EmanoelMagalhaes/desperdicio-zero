import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { assertFirebaseReady, db } from './firebaseClient';

const BILLING_API_BASE_URL = (import.meta.env.VITE_BILLING_API_BASE_URL || '').trim().replace(/\/$/, '');

function assertBillingApiConfigured() {
  if (!BILLING_API_BASE_URL) {
    throw new Error(
      'VITE_BILLING_API_BASE_URL nao configurado. Defina a URL do backend de assinaturas no ambiente.'
    );
  }
}

function timestampToIso(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return '';
}

function normalizeSubscription(record) {
  return {
    ...record,
    createdAt: timestampToIso(record.createdAt),
    updatedAt: timestampToIso(record.updatedAt),
    activatedAt: timestampToIso(record.activatedAt),
    cancelledAt: timestampToIso(record.cancelledAt),
    lastReconciledAt: timestampToIso(record.lastReconciledAt),
  };
}

async function requestBilling(path, { token, body }) {
  assertBillingApiConfigured();
  const response = await fetch(`${BILLING_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body || {}),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Falha no backend de assinatura (${response.status}).`);
  }

  return payload;
}

export async function createSubscription(payload) {
  assertFirebaseReady();
  const token = payload?.token || '';
  if (!token) {
    throw new Error('Token de autenticacao ausente para iniciar assinatura.');
  }

  const result = await requestBilling('/api/subscriptions/start', {
    token,
    body: {
      planId: payload.planId,
      userEmail: payload.userEmail || '',
      userRole: payload.userRole || '',
    },
  });

  return {
    ...result,
    subscription: result.subscription ? normalizeSubscription(result.subscription) : null,
  };
}

export async function reconcileSubscription(payload) {
  assertFirebaseReady();
  const token = payload?.token || '';
  if (!token) {
    throw new Error('Token de autenticacao ausente para reconciliar assinatura.');
  }

  const result = await requestBilling('/api/subscriptions/reconcile', {
    token,
    body: {
      subscriptionRef: payload.subscriptionRef || '',
      preapprovalId: payload.preapprovalId || '',
    },
  });

  return {
    ...result,
    subscription: result.subscription ? normalizeSubscription(result.subscription) : null,
  };
}

export function subscribeUserSubscriptions(userId, onChange, onError) {
  assertFirebaseReady();
  if (!userId) return () => {};

  const subscriptionsQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId));

  return onSnapshot(
    subscriptionsQuery,
    (snapshot) => {
      const items = snapshot.docs
        .map((docItem) => normalizeSubscription({ id: docItem.id, ...(docItem.data() || {}) }))
        .sort((a, b) => {
          const aTime = Date.parse(a.updatedAt || a.createdAt || 0) || 0;
          const bTime = Date.parse(b.updatedAt || b.createdAt || 0) || 0;
          return bTime - aTime;
        });
      onChange(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
