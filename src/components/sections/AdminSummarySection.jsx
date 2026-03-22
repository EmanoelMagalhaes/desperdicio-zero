import { BarChart3, ClipboardList, Package, ShieldCheck, ShoppingCart, Tag, Timer, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { daysUntil } from '../../utils/date';

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

export default function AdminSummarySection({ state }) {
  const navigate = useNavigate();
  const totalClients = state.clientAccounts.length;
  const inventoryCounts = Object.values(state.inventories).map((items) => items.length);
  const shoppingCounts = Object.values(state.shoppingLists).map((items) => items.length);
  const totalProducts = inventoryCounts.reduce((acc, value) => acc + value, 0);
  const averageProducts = totalClients ? Math.round(totalProducts / totalClients) : 0;
  const pendingClients = state.clientAccounts.filter((client) => client.approvalStatus === 'pending').length;

  const orders = state.orders || [];
  const offers = state.offers || [];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const preparingOrders = orders.filter((order) => order.status === 'preparing').length;
  const readyOrders = orders.filter((order) => order.status === 'ready').length;
  const activeOffers = offers.filter((offer) => offer?.isActive !== false).length;

  const recentOrders = [...orders]
    .sort((a, b) => {
      const aTime = parseOrderDate(a.createdAt || a.updatedAt)?.getTime() || 0;
      const bTime = parseOrderDate(b.createdAt || b.updatedAt)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const clientSummary = state.clientAccounts.map((client) => ({
    id: client.id,
    name: client.name,
    businessType: client.businessType,
    productCount: state.inventories[client.id]?.length || 0,
    shoppingCount: state.shoppingLists[client.id]?.length || 0,
    criticalCount: (state.inventories[client.id] || []).filter((item) => daysUntil(item.expiry) <= 2).length,
  }));

  return (
    <div>
      <SectionTitle
        eyebrow="Painel administrativo"
        title="Supervisao e operacao dos clientes"
        text="Acompanhe indicadores gerais e execute operacoes nos ambientes dos clientes em tempo real."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Visao global</div>
              <h2 className="mt-2 text-2xl font-black">Indicadores da plataforma</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Total de pedidos" value={String(totalOrders)} icon={ClipboardList} tone="blue" />
            <MetricCard label="Pedidos pendentes" value={String(pendingOrders)} icon={Timer} tone="amber" />
            <MetricCard label="Em preparo" value={String(preparingOrders)} icon={ShieldCheck} tone="emerald" />
            <MetricCard label="Pedidos prontos" value={String(readyOrders)} icon={ShieldCheck} tone="emerald" />
            <MetricCard label="Ofertas ativas" value={String(activeOffers)} icon={Tag} tone="blue" />
            <MetricCard label="Cadastros pendentes" value={String(pendingClients)} icon={User} tone="amber" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate('/admin/clientes')}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05]"
            >
              Gerenciar clientes
            </button>
            <button
              onClick={() => navigate('/admin/cliente')}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05]"
            >
              Ver ambiente do cliente
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Pedidos recentes</div>
          <h2 className="mt-2 text-2xl font-black">Ultimas solicitacoes</h2>

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
                      {order.restaurantName || 'Restaurante'}
                    </div>
                    <div className="text-xs text-white/55">{formatOrderDate(order.createdAt)}</div>
                  </div>
                  <div className="text-sm text-white/70">{formatCurrency(order.total)}</div>
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

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clientes cadastrados" value={String(totalClients)} icon={User} tone="emerald" />
        <MetricCard label="Produtos monitorados" value={String(totalProducts)} icon={Package} tone="blue" />
        <MetricCard label="Media por cliente" value={String(averageProducts)} icon={BarChart3} tone="amber" />
        <MetricCard
          label="Listas de compra"
          value={String(shoppingCounts.reduce((sum, value) => sum + value, 0))}
          icon={ShoppingCart}
          tone="red"
        />
      </div>

      <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-5">
          <div className="text-xl font-bold">Resumo dos clientes</div>
          <div className="text-sm text-white/55">Acesso rapido aos dados operacionais.</div>
        </div>

        <div className="space-y-3 md:hidden">
          {clientSummary.map((client) => (
            <div key={`mobile-${client.id}`} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
              <div className="text-base font-semibold">{client.name}</div>
              <div className="text-sm text-white/55">{client.businessType}</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Produtos</div>
                  <div className="font-semibold">{client.productCount}</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Criticos</div>
                  <div className="font-semibold">{client.criticalCount}</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Compras</div>
                  <div className="font-semibold">{client.shoppingCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-3xl border border-white/10 md:block">
          <div className="grid min-w-[760px] grid-cols-5 gap-4 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white/70">
            <div>Cliente</div>
            <div>Tipo</div>
            <div>Produtos</div>
            <div>Itens criticos</div>
            <div>Compras</div>
          </div>

          {clientSummary.map((client) => (
            <div
              key={client.id}
              className="grid min-w-[760px] grid-cols-5 gap-4 border-t border-white/10 bg-neutral-950 px-4 py-4 text-sm text-white/78"
            >
              <div>{client.name}</div>
              <div>{client.businessType}</div>
              <div>{client.productCount}</div>
              <div>{client.criticalCount}</div>
              <div>{client.shoppingCount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
