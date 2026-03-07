import { ChefHat, Home, Lightbulb, Package, ShoppingCart } from 'lucide-react';
import AppShell from './AppShell';

const menuItems = [
  { to: '/app/dashboard', label: 'Home', icon: Home },
  { to: '/app/inventory', label: 'Minha despensa', icon: Package },
  { to: '/app/shopping', label: 'Lista de compras', icon: ShoppingCart },
  { to: '/app/recipes', label: 'Receitas sugeridas', icon: ChefHat },
  { to: '/app/tips', label: 'Dicas e desafios', icon: Lightbulb },
];

export default function ClientLayout() {
  return <AppShell menuItems={menuItems} subtitle="Plataforma operacional da sua cozinha inteligente" />;
}