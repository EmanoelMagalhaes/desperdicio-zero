import { normalizeQueryValue } from './http.js';

const MP_API_BASE = (process.env.MERCADOPAGO_API_BASE_URL || 'https://api.mercadopago.com').replace(/\/$/, '');

function getAccessToken() {
  const token = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim();
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN nao configurado no backend.');
  }
  return token;
}

async function mercadoPagoRequest(path) {
  const accessToken = getAccessToken();
  const response = await fetch(`${MP_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Mercado Pago HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function getPreapprovalById(preapprovalId) {
  if (!preapprovalId) {
    throw new Error('ID de assinatura no Mercado Pago nao informado.');
  }
  return mercadoPagoRequest(`/preapproval/${encodeURIComponent(preapprovalId)}`);
}

function extractIdFromResourceUrl(resourceUrl) {
  if (!resourceUrl || typeof resourceUrl !== 'string') return '';
  const cleaned = resourceUrl.trim();
  if (!cleaned) return '';
  const chunks = cleaned.split('/');
  return chunks[chunks.length - 1] || '';
}

export function extractPreapprovalIdFromNotification({ body, query }) {
  const fromBodyData = normalizeQueryValue(body?.data?.id);
  if (fromBodyData) return fromBodyData;

  const fromBodyResource = extractIdFromResourceUrl(normalizeQueryValue(body?.resource));
  if (fromBodyResource) return fromBodyResource;

  const fromQueryData = normalizeQueryValue(query?.['data.id']);
  if (fromQueryData) return fromQueryData;

  const fromQueryId = normalizeQueryValue(query?.id);
  if (fromQueryId) return fromQueryId;

  return '';
}
