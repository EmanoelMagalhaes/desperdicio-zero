import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChefHat, CheckCircle2, ClipboardList, Package, ShoppingCart, Tag, Timer } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { recipeSuggestions } from '../../services/kitchenService';
import { daysUntil, statusFromExpiry } from '../../utils/date';

const ORDER_STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em preparo',
  ready: 'Pronto',
  completed: 'Concluido',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_TONES = {
  pending: 'bg-amber-500/15 text-amber-200',
  confirmed: 'bg-emerald-500/15 text-emerald-200',
  preparing: 'bg-sky-500/15 text-sky-200',
  ready: 'bg-indigo-500/15 text-indigo-200',
  completed: 'bg-emerald-500/15 text-emerald-200',
  cancelled: 'bg-red-500/15 text-red-200',
};

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

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardSection({
  inventory,
  shoppingList,
  sessionName,
  onGoTo,
  address,
  onSaveAddress,
  restaurantOrders = [],
  restaurantOffers = [],
  showOperational = false,
}) {
  const criticalItems = inventory.filter((item) => daysUntil(item.expiry) <= 2);
  const recipes = recipeSuggestions(inventory, { profile: showOperational ? 'restaurant' : 'family', limit: 3 });
  const checkedCount = shoppingList.filter((item) => item.checked).length;
  const [addressValue, setAddressValue] = useState(address || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const operationalStats = useMemo(() => {
    const totals = {
      pending: 0,
      preparing: 0,
      ready: 0,
      total: restaurantOrders.length,
    };

    restaurantOrders.forEach((order) => {
      if (order.status === 'pending') totals.pending += 1;
      if (order.status === 'preparing') totals.preparing += 1;
      if (order.status === 'ready') totals.ready += 1;
    });

    const activeOffers = restaurantOffers.filter((offer) => offer?.isActive !== false).length;
    return { ...totals, activeOffers };
  }, [restaurantOrders, restaurantOffers]);

  const recentOrders = useMemo(() => {
    const withTime = restaurantOrders.map((order) => ({
      ...order,
      __time: parseOrderDate(order.createdAt || order.updatedAt)?.getTime() || 0,
    }));

    return withTime.sort((a, b) => b.__time - a.__time).slice(0, 5);
  }, [restaurantOrders]);

  useEffect(() => {
    setAddressValue(address || '');
  }, [address]);

  async function handleSave() {
    if (!onSaveAddress) return;
    if (!addressValue) {
      setFeedback('Informe um endereco valido.');
      return;
    }

    setSaving(true);
    setFeedback('');
    const result = await onSaveAddress(addressValue);
    setSaving(false);

    if (!result?.ok) {
      setFeedback(result?.error || 'Nao foi possivel salvar o endereco.');
      return;
    }

    setFeedback('Endereco atualizado com sucesso.');
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Visao geral"
        title={`Bem-vindo, ${sessionName}`}
        text={
          showOperational
            ? 'Seu painel inicial mostra pedidos, ofertas ativas e itens criticos da operacao.'
            : 'Seu painel inicial mostra os itens criticos, a lista de compras e acoes recomendadas para reduzir desperdicio.'
        }
      />

      {showOperational ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Pedidos pendentes" value={String(operationalStats.pending)} icon={Timer} tone="amber" />
          <MetricCard label="Em preparo" value={String(operationalStats.preparing)} icon={ChefHat} tone="blue" />
          <MetricCard label="Pedidos prontos" value={String(operationalStats.ready)} icon={CheckCircle2} tone="emerald" />
          <MetricCard label="Total de pedidos" value={String(operationalStats.total)} icon={ClipboardList} tone="blue" />
          <MetricCard label="Ofertas ativas" value={String(operationalStats.activeOffers)} icon={Tag} tone="emerald" />
        </div>
      ) : null}

      <div className={`${showOperational ? 'mt-6' : ''} grid gap-4 md:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Itens cadastrados" value={String(inventory.length)} icon={Package} tone="emerald" />
        <MetricCard label="Itens criticos" value={String(criticalItems.length)} icon={AlertTriangle} tone="red" />
        <MetricCard
          label="Compras concluidas"
          value={`${checkedCount}/${shoppingList.length || 0}`}
          icon={ShoppingCart}
          tone="amber"
        />
        <MetricCard label="Sugestoes ativas" value={String(recipes.length)} icon={ChefHat} tone="blue" />
      </div>

      {showOperational ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Acoes rapidas</div>
                <h2 className="mt-2 text-2xl font-black">Atalhos da operacao</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => onGoTo('/restaurante/pedidos')}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                Ver pedidos
              </button>
              <button
                onClick={() => onGoTo('/restaurante/ofertas/nova')}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                Criar oferta
              </button>
              <button
                onClick={() => onGoTo('/restaurante/ofertas')}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                Ver ofertas
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Pedidos recentes</div>
            <h2 className="mt-2 text-2xl font-black">Resumo da operacao</h2>

            <div className="mt-5 space-y-3">
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                        Pedido #{shortOrderId(order.id)}
                      </div>
                      <div className="mt-1 text-base font-semibold text-white/90">
                        {order.consumerName || 'Consumidor'}
                      </div>
                      <div className="text-xs text-white/55">{formatOrderDate(order.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          ORDER_STATUS_TONES[order.status] || 'bg-white/10 text-white/70'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending}
                      </span>
                      <span className="text-sm text-white/70">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/65">
                  Nenhum pedido recente.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Prioridades</div>
              <h2 className="mt-2 text-2xl font-black">Itens que precisam de acao</h2>
            </div>
            <button
              onClick={() => onGoTo('/app/inventory')}
              className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950"
            >
              Gerenciar despensa
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {criticalItems.length ? (
              criticalItems.map((item) => {
                const status = statusFromExpiry(item.expiry);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-white/55">
                        {item.category} - {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs ${status.tone}`}>{status.label}</span>
                      <span className="text-sm text-emerald-300">Priorizar uso</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
                Nenhum item critico no momento.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Endereco</div>
            <h2 className="mt-2 text-2xl font-black">Local de retirada</h2>
            <div className="mt-4 space-y-3">
              <input
                value={addressValue}
                onChange={(event) => setAddressValue(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                placeholder="Endereco do restaurante"
              />
              <button
                onClick={handleSave}
                disabled={!onSaveAddress || saving}
                className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar endereco'}
              </button>
              {feedback ? (
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-3 text-sm text-white/70">
                  {feedback}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Sugestao do dia</div>
            <h2 className="mt-2 text-2xl font-black">Acao recomendada</h2>
            <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 text-white/82">{recipes[0]?.description}</div>
            <button
              onClick={() => onGoTo('/app/recipes')}
              className="mt-4 rounded-2xl border border-white/10 px-4 py-2 font-semibold text-white/85 transition hover:bg-white/[0.05]"
            >
              Ver receitas sugeridas
            </button>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Execucao</div>
            <h2 className="mt-2 text-2xl font-black">Proximos passos</h2>
            <div className="mt-4 space-y-3 text-white/72">
              <div className="rounded-2xl bg-neutral-900 p-4">1. Conferir validade dos pereciveis.</div>
              <div className="rounded-2xl bg-neutral-900 p-4">2. Revisar a lista de compras antes da reposicao.</div>
              <div className="rounded-2xl bg-neutral-900 p-4">3. Criar promocao com itens de giro lento.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
