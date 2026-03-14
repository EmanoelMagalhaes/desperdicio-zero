import { ROLES, normalizeRole } from '../../types/roles';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../types/permissions';

const DEFAULT_ROLE_ROUTE = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.CLIENT]: '/app/dashboard',
  [ROLES.RESTAURANT]: '/app/dashboard',
  [ROLES.CONSUMER]: '/',
};

export function getDefaultRouteForRole(role) {
  return DEFAULT_ROLE_ROUTE[role] || '/';
}

export function getPermissionsForRole(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return [];
  return ROLE_PERMISSIONS[normalized] || [];
}

export function hasPermission(granted, permission) {
  if (!permission) return false;
  return granted.includes(permission);
}

export function hasAnyPermission(granted, required) {
  if (!required || !required.length) return true;
  return required.some((permission) => hasPermission(granted, permission));
}

export function hasAllPermissions(granted, required) {
  if (!required || !required.length) return true;
  return required.every((permission) => hasPermission(granted, permission));
}

export { ROLES, PERMISSIONS, normalizeRole };
