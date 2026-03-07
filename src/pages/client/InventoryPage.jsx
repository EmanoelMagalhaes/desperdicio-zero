import InventorySection from '../../components/sections/InventorySection';
import { useAppStore } from '../../hooks/useAppStore';

export default function InventoryPage() {
  const { inventory, addInventory, deleteInventory } = useAppStore();

  return <InventorySection items={inventory} onAdd={addInventory} onDelete={deleteInventory} />;
}