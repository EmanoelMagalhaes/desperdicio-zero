import ShoppingSection from '../../components/sections/ShoppingSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function ShoppingPage() {
  const { shoppingList, addShopping, toggleShopping, deleteShopping } = useAppStore();

  return (
    <ShoppingSection
      list={shoppingList}
      onAdd={addShopping}
      onToggle={toggleShopping}
      onDelete={deleteShopping}
    />
  );
}