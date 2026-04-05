import { sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }

  return sendJson(res, 200, {
    ok: true,
    service: 'desperdicio-zero-billing',
    timestamp: new Date().toISOString(),
  });
}
