import RecipesSection from '../../components/sections/RecipesSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function DemoRecipes() {
  const { demoInventory } = useAppStore();

  return <RecipesSection items={demoInventory} />;
}