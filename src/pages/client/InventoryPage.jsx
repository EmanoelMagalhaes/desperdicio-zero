import InventorySection from '../../components/sections/InventorySection';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

export default function InventoryPage() {
  const { inventory, addInventory, deleteInventory, pantryUnlimited, inventoryLimit } = useAppStore();
  const effectiveLimit = inventoryLimit || 50;
  const limitReached = !pantryUnlimited && inventory.length >= effectiveLimit;

  return (
    <div className="space-y-6">
      {pantryUnlimited ? (
        <div className="rounded-[30px] border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          Plano ativo detectado: limite ilimitado de produtos liberado para sua despensa.
        </div>
      ) : null}
      {limitReached ? (
        <div className="rounded-[30px] border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          Voce atingiu o limite de {effectiveLimit} produtos do plano gratuito.
          <Link to="/planos" className="ml-3 inline-flex underline decoration-amber-200/60 underline-offset-4">
            Desbloquear ilimitado
          </Link>
        </div>
      ) : null}
      <InventorySection items={inventory} onAdd={addInventory} onDelete={deleteInventory} limitReached={limitReached} />
    </div>
  );
}
