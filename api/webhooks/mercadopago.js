import crypto from 'node:crypto';
import { adminDb, serverTimestamp } from '../_lib/firebaseAdmin.js';
import { normalizeQueryValue, readJsonBody, sendJson } from '../_lib/http.js';
import { extractPreapprovalIdFromNotification, getPreapprovalById } from '../_lib/mercadoPagoClient.js';
import { syncSubscriptionFromPreapproval } from '../_lib/subscriptionSync.js';

function buildEventId(body, preapprovalId) {
  const source = JSON.stringify({
    id: body?.id || '',
    action: body?.action || '',
    type: body?.type || '',
    dataId: body?.data?.id || '',
    resource: body?.resource || '',
    preapprovalId,
  });

  const hash = crypto.createHash('sha256').update(source).digest('hex').slice(0, 24);
  return `mp_evt_${hash}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }

  try {
    const expectedToken = String(process.env.MERCADOPAGO_WEBHOOK_SECRET || '').trim();
    const receivedToken = normalizeQueryValue(req.query?.token);

    if (expectedToken && receivedToken !== expectedToken) {
      return sendJson(res, 401, { ok: false, error: 'Webhook token invalido.' });
    }

    const body = await readJsonBody(req);
    const preapprovalId = extractPreapprovalIdFromNotification({ body, query: req.query || {} });
    const eventId = buildEventId(body, preapprovalId);
    const eventRef = adminDb.collection('subscription_events').doc(eventId);
    const eventSnapshot = await eventRef.get();

    if (eventSnapshot.exists && eventSnapshot.data()?.processedAt) {
      return sendJson(res, 200, { ok: true, duplicate: true });
    }

    await eventRef.set(
      {
        id: eventId,
        provider: 'mercadopago',
        action: body?.action || '',
        type: body?.type || '',
        preapprovalId: preapprovalId || '',
        resource: body?.resource || '',
        payload: body || {},
        receivedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (!preapprovalId) {
      await eventRef.set(
        {
          processedAt: serverTimestamp(),
          result: 'ignored',
          reason: 'preapproval-id-missing',
        },
        { merge: true }
      );
      return sendJson(res, 200, { ok: true, ignored: true, reason: 'preapproval-id-missing' });
    }

    const preapproval = await getPreapprovalById(preapprovalId);
    const syncResult = await syncSubscriptionFromPreapproval({
      preapproval,
      source: 'webhook',
      eventId,
    });

    await eventRef.set(
      {
        processedAt: serverTimestamp(),
        result: 'processed',
        subscriptionId: syncResult.subscriptionId,
        status: syncResult.subscription?.status || '',
      },
      { merge: true }
    );

    return sendJson(res, 200, {
      ok: true,
      processed: true,
      subscriptionId: syncResult.subscriptionId,
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error?.message || 'Falha ao processar webhook do Mercado Pago.',
    });
  }
}
