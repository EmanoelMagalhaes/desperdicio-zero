import { useEffect, useState } from 'react';
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

const STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em preparo',
  ready: 'Pronto',
  completed: 'Concluido',
  cancelled: 'Cancelado',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'confirmed', label: STATUS_LABELS.confirmed },
  { value: 'preparing', label: STATUS_LABELS.preparing },
  { value: 'ready', label: STATUS_LABELS.ready },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
];

function getStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.pending;
}

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
  const {
    restaurantOrders = [],
    ordersStatus,
    ordersError,
    updateOrderStatus,
    session,
    updateAccountAddress,
  } = useAppStore();
  const [actionError, setActionError] = useState('');
  const [address, setAddress] = useState(session?.address || '');
  const [saving, setSaving] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState('');

  useEffect(() => {
    setAddress(session?.address || '');
  }, [session?.address]);

  async function handleStatusChange(orderId, nextStatus) {
    setActionError('');
    const result = await updateOrderStatus(orderId, nextStatus);
    if (!result.ok) {
      setActionError(result.error || 'Nao foi possivel atualizar o pedido.');
    }
  }

  async function handleSaveAddress() {
    if (!address) {
      setAddressFeedback('Informe um endereco valido.');
      return;
    }

    setSaving(true);
    setAddressFeedback('');
    const result = await updateAccountAddress(address);
    setSaving(false);

    if (!result.ok) {
      setAddressFeedback(result.error || 'Nao foi possivel salvar o endereco.');
      return;
    }

    setAddressFeedback('Endereco atualizado com sucesso.');
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Pedidos recebidos"
        title="Acompanhe os pedidos do seu restaurante"
        text="Veja os pedidos enviados pelos consumidores e organize a operacao."
      />

      <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Endereco do restaurante</div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
            placeholder="Endereco de retirada"
          />
          <button
            onClick={handleSaveAddress}
            disabled={saving}
            className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar endereco'}
          </button>
        </div>
        {addressFeedback ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-neutral-900 p-3 text-sm text-white/70">
            {addressFeedback}
          </div>
        ) : null}
      </div>

      {ordersStatus === 'error' ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {ordersError || 'Nao foi possivel carregar os pedidos.'}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {actionError}
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
                  {getStatusLabel(order.status)}
                </span>
                <div className="text-sm text-white/60">
                  Total: <span className="text-white/90">{formatCurrency(order.total)}</span>
                </div>
                <div className="text-sm text-white/50">{formatOrderDate(order.createdAt)}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={`${order.id}-${status.value}`}
                  onClick={() => handleStatusChange(order.id, status.value)}
                  disabled={order.status === status.value}
                  className="rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-50"
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
