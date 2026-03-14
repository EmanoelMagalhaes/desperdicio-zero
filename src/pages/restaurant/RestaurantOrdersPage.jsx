import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

const STATUS_TONES = {
  pending: 'bg-amber-500/15 text-amber-200',
  confirmed: 'bg-emerald-500/15 text-emerald-200',
  preparing: 'bg-sky-500/15 text-sky-200',
  ready: 'bg-indigo-500/15 text-indigo-200',
  completed: 'bg-emerald-500/15 text-emerald-200',
  cancelled: 'bg-red-500/15 text-red-200',
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseOrderDate(value) {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  return null;
}

function formatOrderDate(value) {
  const date = parseOrderDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Data indisponivel';
  return date.toLocaleString('pt-BR');
}

function shortOrderId(orderId) {
  if (!orderId) return '--';
  return String(orderId).slice(-6).toUpperCase();
}

export default function RestaurantOrdersPage() {
  const { restaurantOrders = [], ordersStatus, ordersError } = useAppStore();

  return (
    <div>
      <SectionTitle
        eyebrow="Pedidos recebidos"
        title="Acompanhe os pedidos do seu restaurante"
        text="Veja os pedidos enviados pelos consumidores e organize a operacao."
      />

      {ordersStatus === 'error' ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {ordersError || 'Nao foi possivel carregar os pedidos.'}
        </div>
      ) : null}

      {ordersStatus === 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Carregando pedidos...
        </div>
      ) : null}

      {!restaurantOrders.length && ordersStatus !== 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Nenhum pedido recebido ainda.
        </div>
      ) : null}

      <div className="space-y-4">
        {restaurantOrders.map((order) => (
          <div key={order.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                  Pedido #{shortOrderId(order.id)}
                </div>
                <div className="mt-2 text-xl font-black">{order.consumerName || 'Consumidor'}</div>
                <div className="mt-2 text-sm text-white/60">
                  WhatsApp: <span className="text-white/90">{order.consumerPhone || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <span className={`rounded-full px-3 py-1 text-xs ${STATUS_TONES[order.status] || 'bg-white/10 text-white/70'}`}>
                  {order.status || 'pending'}
                </span>
                <div className="text-sm text-white/60">
                  Total: <span className="text-white/90">{formatCurrency(order.total)}</span>
                </div>
                <div className="text-sm text-white/50">{formatOrderDate(order.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
