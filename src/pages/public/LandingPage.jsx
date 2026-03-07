import { AlertTriangle, ChefHat, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import { useAppStore } from '../../hooks/useAppStore';
import { recipeSuggestions } from '../../services/kitchenService';
import { daysUntil } from '../../utils/date';

export default function LandingPage() {
  const { demoInventory, demoShoppingList } = useAppStore();
  const demoRecipes = recipeSuggestions(demoInventory);
  const criticalCount = demoInventory.filter((item) => daysUntil(item.expiry) <= 2).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Explore o sistema antes de criar sua conta
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Plataforma para reduzir desperdicio e operar uma{' '}
              <span className="text-emerald-400">Cozinha Inteligente</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Navegue pela area publica, veja estoque, compras, receitas e desafios com dados reais de demonstracao.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-neutral-950">
                Criar conta
              </Link>
              <Link
                to="/demo/kitchen"
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                Ver demo da despensa
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Resumo da demonstracao</div>
                <div className="mt-2 text-2xl font-black">Visao rapida do sistema</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Demo publica</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Produtos de exemplo" value={String(demoInventory.length)} icon={Package} tone="emerald" />
              <MetricCard label="Itens criticos" value={String(criticalCount)} icon={AlertTriangle} tone="red" />
              <MetricCard label="Receitas sugeridas" value={String(demoRecipes.length)} icon={ChefHat} tone="blue" />
              <MetricCard label="Itens na compra" value={String(demoShoppingList.length)} icon={ShoppingCart} tone="amber" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-3">
        <Link
          to="/demo/kitchen"
          className="rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:bg-white/[0.05]"
        >
          <div className="text-lg font-bold">DemoKitchen</div>
          <p className="mt-2 text-sm text-white/65">Estoque com validade, categorias e acoes operacionais.</p>
        </Link>

        <Link
          to="/demo/recipes"
          className="rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:bg-white/[0.05]"
        >
          <div className="text-lg font-bold">DemoRecipes</div>
          <p className="mt-2 text-sm text-white/65">Sugestoes automaticas baseadas no estoque atual.</p>
        </Link>

        <Link
          to="/demo/shopping"
          className="rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:bg-white/[0.05]"
        >
          <div className="text-lg font-bold">DemoShopping</div>
          <p className="mt-2 text-sm text-white/65">Lista de compras priorizada para reposicao inteligente.</p>
        </Link>
      </section>
    </div>
  );
}