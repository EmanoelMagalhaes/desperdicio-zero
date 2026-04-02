import { FileText, LayoutDashboard, LayoutGrid, Megaphone, ShieldCheck, Users, User } from 'lucide-react';
import AppShell from './AppShell';

const menuItems = [
  { to: '/admin/dashboard', label: 'Painel admin', icon: LayoutDashboard },
  { to: '/admin/meus-dados', label: 'Meus dados', icon: User },
  { to: '/admin/cms', label: 'CMS interno', icon: LayoutGrid },
  { to: '/admin/cms-publico', label: 'CMS publico', icon: FileText },
  { to: '/admin/anuncios', label: 'Anuncios', icon: Megaphone },
  { to: '/admin/clientes', label: 'Gerenciar clientes', icon: Users },
  { to: '/admin/cliente', label: 'Visao do cliente', icon: ShieldCheck },
];

export default function AdminLayout() {
  return <AppShell menuItems={menuItems} subtitle="Supervisao operacional com acesso ao ambiente dos clientes" />;
}
