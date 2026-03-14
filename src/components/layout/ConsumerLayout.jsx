import { ClipboardList, Tag } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import AppShell from './AppShell';

const menuItems = [
  { to: '/ofertas', label: 'Ofertas', icon: Tag },
  { to: '/meus-pedidos', label: 'Meus pedidos', icon: ClipboardList },
];

export default function ConsumerLayout() {
  const { consumerOrders } = useAppStore();

  const activeCount = useMemo(
    () => consumerOrders.filter((order) => !['finalized', 'cancelled'].includes(order.status)).length,
    [consumerOrders]
  );

  return (
    <AppShell
      menuItems={menuItems}
      subtitle="Ofertas e pedidos dos restaurantes parceiros"
      showBackup={false}
      statusValue={activeCount}
      statusLabel="pedido(s) ativos"
    />
  );
}
