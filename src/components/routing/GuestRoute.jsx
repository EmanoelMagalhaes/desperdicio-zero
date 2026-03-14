import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { getDefaultRouteForRole, normalizeRole } from '../../modules/rbac/rbac';

export default function GuestRoute() {
  const { ready, session } = useAppStore();

  if (!ready) return null;

  const role = normalizeRole(session?.role);
  if (role) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
