import { adminAuth, adminDb } from '../_lib/firebaseAdmin.js';
import { findPreapprovalByExternalReference, getPreapprovalById } from '../_lib/mercadoPagoClient.js';
import { applyCors, getBearerToken, handleOptions, readJsonBody, sendJson } from '../_lib/http.js';
import { syncSubscriptionFromPreapproval } from '../_lib/subscriptionSync.js';

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

function normalizeSubscription(snapshot) {
  const data = snapshot.data() || {};
  const payload = { id: snapshot.id, ...data };
  ['createdAt', 'updatedAt', 'activatedAt', 'cancelledAt', 'lastReconciledAt'].forEach((key) => {
    const value = payload[key];
    if (value && typeof value.toDate === 'function') {
      payload[key] = value.toDate().toISOString();
    }
  });
  return payload;
}

async function findLatestUserSubscription(userId) {
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

export default async function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }

  try {
    const bearerToken = getBearerToken(req);
    if (!bearerToken) {
      return sendJson(res, 401, { ok: false, error: 'Token de autenticacao ausente.' });
    }

    const decoded = await adminAuth.verifyIdToken(bearerToken);
    const body = await readJsonBody(req);
    const subscriptionRef = String(body?.subscriptionRef || '').trim();
    const preapprovalIdFromBody = String(body?.preapprovalId || '').trim();

    let targetSnapshot = null;
    if (subscriptionRef) {
      const snapshot = await adminDb.collection('subscriptions').doc(subscriptionRef).get();
      if (snapshot.exists && snapshot.data()?.userId === decoded.uid) {
        targetSnapshot = snapshot;
      }
    }

    if (!targetSnapshot) {
      targetSnapshot = await findLatestUserSubscription(decoded.uid);
    }

    if (!targetSnapshot) {
      return sendJson(res, 200, {
        ok: true,
        reconciled: false,
        reason: 'subscription-not-found',
      });
    }

    const target = targetSnapshot.data() || {};
    const preapprovalId = preapprovalIdFromBody || target.providerSubscriptionId || '';
    const externalReference = subscriptionRef || target.externalReference || target.id || targetSnapshot.id;

    let preapproval = null;
    let resolvedBy = '';

    if (preapprovalId) {
      preapproval = await getPreapprovalById(preapprovalId);
      resolvedBy = 'provider-subscription-id';
    } else if (externalReference) {
      preapproval = await findPreapprovalByExternalReference(externalReference);
      resolvedBy = preapproval ? 'external-reference' : '';
    }

    if (!preapproval) {
      const reason = preapprovalId
        ? 'provider-subscription-not-found'
        : externalReference
          ? 'provider-subscription-not-found-by-external-reference'
          : 'provider-subscription-id-missing';
      return sendJson(res, 200, {
        ok: true,
        reconciled: false,
        reason,
        attemptedExternalReference: externalReference || '',
        subscription: normalizeSubscription(targetSnapshot),
      });
    }

    const result = await syncSubscriptionFromPreapproval({
      preapproval,
      source: 'reconcile',
      forcedSubscriptionId: targetSnapshot.id,
      fallbackUserId: decoded.uid,
      fallbackUserEmail: decoded.email || target.userEmail || '',
      fallbackUserRole: target.userRole || '',
    });

    return sendJson(res, 200, {
      ok: true,
      reconciled: true,
      resolvedBy,
      subscription: result.subscription,
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error?.message || 'Nao foi possivel reconciliar a assinatura.',
    });
  }
}
