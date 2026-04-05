import { adminAuth, adminDb, serverTimestamp } from '../_lib/firebaseAdmin.js';
import { applyCors, getBearerToken, handleOptions, readJsonBody, sendJson } from '../_lib/http.js';
import { buildCheckoutUrl, getPaidPlanById, hasPantryUnlimitedEntitlement } from '../_lib/subscriptionModel.js';

function createSubscriptionId() {
  const chunk = Math.random().toString(36).slice(2, 8);
  return `sub_${Date.now()}_${chunk}`;
}

function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'admin' || role === 'consumer' || role === 'client' || role === 'restaurant') return role;
  return '';
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
    const planId = String(body?.planId || '').trim();
    const plan = getPaidPlanById(planId);

    if (!plan) {
      return sendJson(res, 400, { ok: false, error: 'Plano invalido ou checkout nao configurado.' });
    }

    const userSnapshot = await adminDb.collection('users').doc(decoded.uid).get();
    const userProfile = userSnapshot.exists ? userSnapshot.data() || {} : {};
    const userRole = normalizeRole(userProfile.role || body?.userRole);
    const userEmail = String(userProfile.email || decoded.email || body?.userEmail || '').trim().toLowerCase();

    const subscriptionId = createSubscriptionId();
    const checkoutUrl = buildCheckoutUrl(plan, {
      externalReference: subscriptionId,
      payerEmail: userEmail,
    });

    const status = 'pending';
    const payload = {
      id: subscriptionId,
      provider: 'mercadopago',
      status,
      providerStatus: status,
      userId: decoded.uid,
      userEmail,
      userRole: userRole || 'consumer',
      planId: plan.id,
      planName: plan.name,
      price: Number(plan.priceValue || 0),
      currency: 'BRL',
      billingPeriod: plan.billingPeriod || 'mensal',
      externalReference: subscriptionId,
      checkoutUrl,
      entitlements: {
        pantryUnlimited: hasPantryUnlimitedEntitlement({
          planId: plan.id,
          userRole: userRole || 'consumer',
          status,
        }),
      },
      lastSource: 'start',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await adminDb.collection('subscriptions').doc(subscriptionId).set(payload, { merge: true });

    return sendJson(res, 200, {
      ok: true,
      checkoutUrl,
      subscription: {
        id: subscriptionId,
        status,
        planId: plan.id,
        planName: plan.name,
        userId: decoded.uid,
        userRole: userRole || 'consumer',
        userEmail,
      },
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error?.message || 'Nao foi possivel iniciar a assinatura.',
    });
  }
}
