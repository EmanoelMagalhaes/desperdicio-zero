import { useNavigate } from 'react-router-dom';
import DashboardSection from '../../components/sections/DashboardSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function DashboardPage() {
  const { inventory, shoppingList, session } = useAppStore();
  const navigate = useNavigate();

  return (
    <DashboardSection
      inventory={inventory}
      shoppingList={shoppingList}
      sessionName={session?.name || 'Cliente'}
      onGoTo={navigate}
    />
  );
}