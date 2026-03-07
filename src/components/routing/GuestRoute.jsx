import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

export default function GuestRoute() {
  const { ready, session } = useAppStore();

  if (!ready) return null;

  if (session?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (session?.role === 'client') return <Navigate to="/app/dashboard" replace />;

  return <Outlet />;
}