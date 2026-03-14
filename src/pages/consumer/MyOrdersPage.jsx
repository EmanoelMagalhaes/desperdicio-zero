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

function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Pendente';
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MyOrdersPage() {
  const { consumerOrders = [], session, updateAccountAddress } = useAppStore();
  const [address, setAddress] = useState(session?.address || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setAddress(session?.address || '');
  }, [session?.address]);

  async function handleSaveAddress() {
    if (!address) {
      setFeedback('Informe um endereco valido.');
      return;
    }

    setSaving(true);
    setFeedback('');
    const result = await updateAccountAddress(address);
    setSaving(false);

    if (!result.ok) {
      setFeedback(result.error || 'Nao foi possivel salvar o endereco.');
      return;
    }

    setFeedback('Endereco atualizado com sucesso.');
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Meus pedidos"
        title="Acompanhe o andamento das suas solicitacoes"
        text="Veja o historico basico dos pedidos enviados e o status atual de cada restaurante."
      />

      <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Meu endereco</div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
            placeholder="Endereco completo"
          />
          <button
            onClick={handleSaveAddress}
            disabled={saving}
            className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar endereco'}
          </button>
        </div>
        {feedback ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-neutral-900 p-3 text-sm text-white/70">
            {feedback}
          </div>
        ) : null}
      </div>

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
                {getStatusLabel(order.status)}
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
