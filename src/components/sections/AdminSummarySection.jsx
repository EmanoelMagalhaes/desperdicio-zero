import { BarChart3, Package, ShoppingCart, User } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { daysUntil } from '../../utils/date';

export default function AdminSummarySection({ state }) {
  const totalClients = state.clientAccounts.length;
  const inventoryCounts = Object.values(state.inventories).map((items) => items.length);
  const shoppingCounts = Object.values(state.shoppingLists).map((items) => items.length);
  const totalProducts = inventoryCounts.reduce((acc, value) => acc + value, 0);
  const averageProducts = totalClients ? Math.round(totalProducts / totalClients) : 0;

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="overflow-x-auto rounded-3xl border border-white/10">
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