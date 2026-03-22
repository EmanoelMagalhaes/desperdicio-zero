import { CMS_SECTIONS, cmsDefaults } from '../data/cmsDefaults';

function uniqueList(list) {
  const seen = new Set();
  const result = [];
  list.forEach((item) => {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  });
  return result;
}

export function sanitizeSectionsOrder(order) {
  const base = Array.isArray(order) ? order : [];
  const filtered = base.filter((item) => CMS_SECTIONS.includes(item));
  const unique = uniqueList(filtered);
  CMS_SECTIONS.forEach((item) => {
    if (!unique.includes(item)) unique.push(item);
  });
  return unique;
}

export function normalizeCms(raw) {
  const data = raw || {};
  const home = data.home || {};
  const hero = home.hero || {};
  const sectionsOrder = sanitizeSectionsOrder(home.sectionsOrder || cmsDefaults.home.sectionsOrder);
  const sectionsEnabled = CMS_SECTIONS.reduce((acc, key) => {
    acc[key] = home.sectionsEnabled?.[key];
    if (typeof acc[key] !== 'boolean') {
      acc[key] = cmsDefaults.home.sectionsEnabled[key];
    }
    return acc;
  }, {});

  const banners = Array.isArray(data.banners) ? data.banners : cmsDefaults.banners;
  const highlights = Array.isArray(data.highlights) ? data.highlights : cmsDefaults.highlights;
  const featuredOffers = Array.isArray(data.featuredOffers) ? data.featuredOffers : cmsDefaults.featuredOffers;

  return {
    site: {
      ...cmsDefaults.site,
      ...(data.site || {}),
    },
    home: {
      hero: {
        ...cmsDefaults.home.hero,
        ...hero,
      },
      sectionsOrder,
      sectionsEnabled,
    },
    banners,
    highlights,
    featuredOffers,
    contact: {
      ...cmsDefaults.contact,
      ...(data.contact || {}),
    },
  };
}

export function resolveFeaturedOffers(offers, featuredIds, limit = 4) {
  const activeOffers = (offers || []).filter((offer) => offer?.isActive !== false);
  const byId = new Map(activeOffers.map((offer) => [offer.id, offer]));
  const selected = (featuredIds || [])
    .map((id) => byId.get(id))
    .filter(Boolean);
  const selectedIds = new Set(selected.map((offer) => offer.id));
  const fallback = activeOffers.filter((offer) => !selectedIds.has(offer.id));
  return [...selected, ...fallback].slice(0, limit);
}

export function sanitizeFeaturedOffers(offers, featuredIds) {
  const activeOffers = (offers || []).filter((offer) => offer?.isActive !== false);
  const byId = new Map(activeOffers.map((offer) => [offer.id, offer]));
  return (featuredIds || []).filter((id) => byId.has(id));
}
