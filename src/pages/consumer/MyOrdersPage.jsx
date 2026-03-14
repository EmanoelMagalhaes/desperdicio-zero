import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

const STATUS_TONES = {
  pending: 'bg-amber-500/15 text-amber-200',
  confirmed: 'bg-emerald-500/15 text-emerald-200',
  preparing: 'bg-sky-500/15 text-sky-200',
  ready: 'bg-indigo-500/15 text-indigo-200',
  finalized: 'bg-emerald-500/15 text-emerald-200',
  cancelled: 'bg-red-500/15 text-red-200',
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MyOrdersPage() {
  const { consumerOrders = [] } = useAppStore();

  return (
    <div>
      <SectionTitle
        eyebrow="Meus pedidos"
        title="Acompanhe o andamento das suas solicitacoes"
        text="Veja o historico basico dos pedidos enviados e o status atual de cada restaurante."
      />

      {!consumerOrders.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Voce ainda nao possui pedidos registrados.
        </div>
      ) : null}

      <div className="space-y-4">
        {consumerOrders.map((order) => (
          <div key={order.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                  {order.restaurantName || 'Restaurante'}
                </div>
                <div className="mt-2 text-xl font-black">Pedido #{order.id}</div>
                <div className="mt-2 text-sm text-white/60">
                  Total: <span className="text-white/90">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${STATUS_TONES[order.status] || 'bg-white/10 text-white/70'}`}>
                {order.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {(order.items || []).map((item) => (
                <div key={`${order.id}-${item.offerId}`} className="flex items-center justify-between text-sm text-white/70">
                  <span>
                    {item.quantity}x {item.title}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {order.notes ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/60">
                Observacoes: {order.notes}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
