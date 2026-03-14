export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  RESTAURANT: 'restaurant',
  CONSUMER: 'consumer',
};

export const ROLE_LIST = Object.values(ROLES);

export function normalizeRole(role) {
  if (!role) return null;
  return ROLE_LIST.includes(role) ? role : null;
}

export function isOperationalRole(role) {
  return role === ROLES.CLIENT || role === ROLES.RESTAURANT;
}
