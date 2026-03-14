import { Minus, Plus, Trash2 } from 'lucide-react';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Item</div>
        <div className="mt-2 text-lg font-semibold">{item.title}</div>
        <div className="mt-1 text-sm text-white/60">{formatCurrency(item.unitPrice)}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <button
            onClick={onDecrease}
            className="rounded-full border border-white/10 p-1 text-white/70 hover:bg-white/10"
            aria-label="Diminuir"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-semibold">{item.quantity}</span>
          <button
            onClick={onIncrease}
            className="rounded-full border border-white/10 p-1 text-white/70 hover:bg-white/10"
            aria-label="Aumentar"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="text-sm font-semibold text-emerald-200">{formatCurrency(item.subtotal)}</div>
        <button
          onClick={onRemove}
          className="rounded-2xl border border-red-500/20 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
