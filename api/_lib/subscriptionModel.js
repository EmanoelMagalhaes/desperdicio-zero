const PLAN_CONFIG = {
  'familia-plus': {
    id: 'familia-plus',
    name: 'Familia Plus',
    priceValue: 24.99,
    billingPeriod: 'mensal',
    checkoutEnvKey: 'MP_CHECKOUT_FAMILIA_PLUS',
  },
  'gestao-plus': {
    id: 'gestao-plus',
    name: 'Gestao Plus',
    priceValue: 24.99,
    billingPeriod: 'mensal',
    checkoutEnvKey: 'MP_CHECKOUT_GESTAO_PLUS',
  },
  'marketplace-flex': {
    id: 'marketplace-flex',
    name: 'Marketplace Flex',
    priceValue: 49.99,
    billingPeriod: 'mensal',
    checkoutEnvKey: 'MP_CHECKOUT_MARKETPLACE_FLEX',
  },
  'marketplace-pro': {
    id: 'marketplace-pro',
    name: 'Marketplace Pro',
    priceValue: 98.99,
    billingPeriod: 'mensal',
    checkoutEnvKey: 'MP_CHECKOUT_MARKETPLACE_PRO',
  },
  'anuncio-standard': {
    id: 'anuncio-standard',
    name: 'Anuncio Standard',
    priceValue: 149.99,
    billingPeriod: 'mensal',
    checkoutEnvKey: 'MP_CHECKOUT_ANUNCIO_STANDARD',
  },
};

const PANTRY_ELIGIBLE_BY_ROLE = {
  consumer: new Set(['familia-plus']),
  client: new Set(['gestao-plus', 'marketplace-flex', 'marketplace-pro']),
  restaurant: new Set(['gestao-plus', 'marketplace-flex', 'marketplace-pro']),
};

export function getPlanById(planId) {
  const config = PLAN_CONFIG[planId];
  if (!config) return null;

  const checkoutUrl = (process.env[config.checkoutEnvKey] || '').trim();
  return { ...config, checkoutUrl };
}

export function getPaidPlanById(planId) {
  const plan = getPlanById(planId);
  if (!plan || Number(plan.priceValue || 0) <= 0) return null;
  if (!plan.checkoutUrl) return null;
  return plan;
}

export function extractProviderPlanIdFromCheckoutUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('preapproval_plan_id') || '';
  } catch {
    return '';
  }
}

export function resolvePlanIdFromProviderPlanId(providerPlanId) {
  if (!providerPlanId) return '';

  const entries = Object.values(PLAN_CONFIG);
  for (const plan of entries) {
    const checkoutUrl = (process.env[plan.checkoutEnvKey] || '').trim();
    if (!checkoutUrl) continue;

    const mappedProviderPlanId = extractProviderPlanIdFromCheckoutUrl(checkoutUrl);
    if (mappedProviderPlanId && mappedProviderPlanId === providerPlanId) {
      return plan.id;
    }
  }

  return '';
}

export function normalizeInternalStatus(providerStatus) {
  const status = String(providerStatus || '')
    .trim()
    .toLowerCase();

  if (status === 'authorized' || status === 'active') return 'active';
  if (status === 'paused') return 'paused';
  if (status === 'cancelled' || status === 'canceled') return 'cancelled';
  if (status === 'rejected') return 'rejected';
  if (status === 'expired') return 'expired';
  return 'pending';
}

export function hasPantryUnlimitedEntitlement({ planId, userRole, status }) {
  if (status !== 'active') return false;
  const allowed = PANTRY_ELIGIBLE_BY_ROLE[userRole];
  if (!allowed) return false;
  return allowed.has(planId);
}

export function getPublicStatusUrl(status, subscriptionRef) {
  const appBase = (process.env.APP_PUBLIC_URL || '').trim().replace(/\/$/, '');
  if (!appBase) return '';
  const query = subscriptionRef ? `?subscription_ref=${encodeURIComponent(subscriptionRef)}` : '';
  return `${appBase}/#/assinatura/${status}${query}`;
}

export function buildCheckoutUrl(plan, { externalReference, payerEmail } = {}) {
  const parsed = new URL(plan.checkoutUrl);

  if (externalReference) {
    parsed.searchParams.set('external_reference', externalReference);
    parsed.searchParams.set('back_url', getPublicStatusUrl('pendente', externalReference));
  }

  if (payerEmail) {
    parsed.searchParams.set('payer_email', payerEmail);
  }

  parsed.searchParams.set('reason', plan.name);

  return parsed.toString();
}
