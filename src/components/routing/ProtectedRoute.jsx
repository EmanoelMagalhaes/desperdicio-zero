import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { getDefaultRouteForRole, hasAnyPermission, normalizeRole } from '../../modules/rbac/rbac';

export default function ProtectedRoute({ allowRoles = [], allowPermissions = [] }) {
  const { ready, session, sessionPermissions = [] } = useAppStore();

  if (!ready) return null;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(session.role);
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles.length && !allowRoles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  if (allowPermissions.length && !hasAnyPermission(sessionPermissions, allowPermissions)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
