import RecipesSection from '../../components/sections/RecipesSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function RecipesPage() {
  const { inventory, session } = useAppStore();

  return <RecipesSection items={inventory} profile={session?.role} />;
}
