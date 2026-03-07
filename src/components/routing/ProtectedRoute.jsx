import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

export default function ProtectedRoute({ allowRoles }) {
  const { ready, session } = useAppStore();

  if (!ready) return null;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!allowRoles.includes(session.role)) {
    return <Navigate to={session.role === 'admin' ? '/admin/dashboard' : '/app/dashboard'} replace />;
  }

  return <Outlet />;
}