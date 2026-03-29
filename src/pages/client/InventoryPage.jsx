import InventorySection from '../../components/sections/InventorySection';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

export default function InventoryPage() {
  const { inventory, addInventory, deleteInventory } = useAppStore();
  const limitReached = inventory.length >= 50;

  return (
    <div className="space-y-6">
      {limitReached ? (
        <div className="rounded-[30px] border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          Voce atingiu o limite de 50 produtos do plano gratuito.
          <Link to="/planos" className="ml-3 inline-flex underline decoration-amber-200/60 underline-offset-4">
            Desbloquear ilimitado
          </Link>
        </div>
      ) : null}
      <InventorySection items={inventory} onAdd={addInventory} onDelete={deleteInventory} />
    </div>
  );
}
