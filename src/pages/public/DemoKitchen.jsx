import InventorySection from '../../components/sections/InventorySection';
import { useAppStore } from '../../hooks/useAppStore';

export default function DemoKitchen() {
  const { demoInventory } = useAppStore();

  return (
    <InventorySection
      items={demoInventory}
      readOnly
      onAdd={() => {}}
      onDelete={() => {}}
    />
  );
}