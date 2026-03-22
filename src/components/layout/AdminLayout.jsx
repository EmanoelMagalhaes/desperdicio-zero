import { LayoutDashboard, LayoutGrid, ShieldCheck, Users } from 'lucide-react';
import AppShell from './AppShell';

const menuItems = [
  { to: '/admin/dashboard', label: 'Painel admin', icon: LayoutDashboard },
  { to: '/admin/cms', label: 'CMS interno', icon: LayoutGrid },
  { to: '/admin/clientes', label: 'Gerenciar clientes', icon: Users },
  { to: '/admin/cliente', label: 'Visao do cliente', icon: ShieldCheck },
];

export default function AdminLayout() {
  return <AppShell menuItems={menuItems} subtitle="Supervisao operacional com acesso ao ambiente dos clientes" />;
}
