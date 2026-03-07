import ShoppingSection from '../../components/sections/ShoppingSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function DemoShopping() {
  const { demoShoppingList } = useAppStore();

  return (
    <ShoppingSection
      list={demoShoppingList}
      readOnly
      onAdd={() => {}}
      onToggle={() => {}}
      onDelete={() => {}}
    />
  );
}