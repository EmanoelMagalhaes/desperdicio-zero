import { AlertTriangle, ChefHat, Package, ShoppingCart } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import SectionTitle from '../common/SectionTitle';
import { recipeSuggestions } from '../../services/kitchenService';
import { daysUntil, statusFromExpiry } from '../../utils/date';

export default function DashboardSection({ inventory, shoppingList, sessionName, onGoTo }) {
  const criticalItems = inventory.filter((item) => daysUntil(item.expiry) <= 2);
  const recipes = recipeSuggestions(inventory);
  const checkedCount = shoppingList.filter((item) => item.checked).length;

  return (
    <div>
      <SectionTitle
        eyebrow="Visao geral"
        title={`Bem-vindo, ${sessionName}`}
        text="Seu painel inicial mostra os itens criticos, a lista de compras e acoes recomendadas para reduzir desperdicio."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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