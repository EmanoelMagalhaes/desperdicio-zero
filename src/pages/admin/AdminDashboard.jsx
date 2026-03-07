import AdminSummarySection from '../../components/sections/AdminSummarySection';
import { useAppStore } from '../../hooks/useAppStore';

export default function AdminDashboard() {
  const { state } = useAppStore();

  return <AdminSummarySection state={state} />;
}