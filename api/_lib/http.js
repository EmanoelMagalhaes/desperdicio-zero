export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function applyCors(req, res) {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin || '';

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(req, res) {
  if (req.method !== 'OPTIONS') return false;
  res.status(204).end();
  return true;
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

export function normalizeQueryValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  if (typeof value === 'string') return value;
  return '';
}
