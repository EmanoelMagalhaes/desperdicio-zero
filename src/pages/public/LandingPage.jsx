import {
  AlertTriangle,
  ChefHat,
  Gift,
  Handshake,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Leaf,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import OfferCard from '../../components/common/OfferCard';
import { useAppStore } from '../../hooks/useAppStore';
import { recipeSuggestions } from '../../services/kitchenService';
import { daysUntil } from '../../utils/date';
import { resolveFeaturedOffers } from '../../utils/cms';

export default function LandingPage() {
  const { demoInventory, demoShoppingList, offers, cmsPublic, ads } = useAppStore();
  const demoRecipes = recipeSuggestions(demoInventory, { profile: 'restaurant', limit: 4 });
  const criticalCount = demoInventory.filter((item) => daysUntil(item.expiry) <= 2).length;
  const activeOffers = (offers || []).filter((offer) => offer?.isActive !== false);
  const featuredOffers = resolveFeaturedOffers(offers || [], cmsPublic.featuredOffers, 4);
  const lastChanceOffers = activeOffers.filter((offer) => offer?.urgency === 'last' || offer?.isLastChance);
  const activeAds = (ads || []).filter((ad) => ad.status === 'approved' && ad.isActive);

  const sponsoredAd = activeAds
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })[0];

  const heroTitlePrefix = cmsPublic.home?.hero?.titlePrefix || 'Menos desperdicio. Mais controle.';
  const heroTitleHighlight = cmsPublic.home?.hero?.titleHighlight || 'Mais vendas';
  const heroBadge = cmsPublic.home?.hero?.badge || 'Conheca a plataforma antes de criar sua conta';
  const heroDescription =
    cmsPublic.home?.hero?.description ||
    'Plataforma profissional para familias organizarem a despensa, restaurantes venderem melhor e parceiros ampliarem visibilidade.';
  const ctaPrimary = cmsPublic.home?.hero?.ctaPrimary || 'Criar conta';
  const ctaSecondary = cmsPublic.home?.hero?.ctaSecondary || 'Ver planos';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              {heroBadge}
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {heroTitlePrefix} <span className="text-emerald-400">{heroTitleHighlight}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-neutral-950">
                {ctaPrimary}
              </Link>
              <Link
                to="/planos"
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                {ctaSecondary}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/55">
              <span className="rounded-full border border-white/10 px-3 py-1">Familias</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Restaurantes</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Parceiros</span>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Resumo operacional</div>
                <div className="mt-2 text-2xl font-black">Visao rapida do sistema</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Amostra publica</div>
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

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Patrocinado</div>
            <h2 className="mt-2 text-2xl font-black">{sponsoredAd?.title || 'Espaco patrocinado'}</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/65">
              {sponsoredAd?.description ||
                'Destaque para marcas e parceiros com solucao alinhada a reducao de desperdicio.'}
            </p>
          </div>
          <a
            href={sponsoredAd?.ctaUrl || '#anuncie'}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05]"
          >
            {sponsoredAd?.ctaLabel || 'Quero anunciar'}
          </a>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              {sponsoredAd?.advertiserName || 'Anunciante parceiro'}
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              Patrocinado
            </span>
          </div>
          {sponsoredAd?.imageUrl ? (
            <img
              src={sponsoredAd.imageUrl}
              alt={sponsoredAd.title}
              className="mt-4 w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/55">
              Espaco reservado para banner aprovado pelo admin.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Como funciona</div>
        <h2 className="mt-2 text-2xl font-black">Tres passos simples para reduzir perdas</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Cadastre seus produtos',
              text: 'Organize itens, validade e quantidade em um unico lugar.',
            },
            {
              title: 'Receba alertas inteligentes',
              text: 'Priorize o que esta vencendo e aja antes de perder.',
            },
            {
              title: 'Transforme em valor',
              text: 'Planeje receitas ou publique ofertas para vender mais.',
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Passo {index + 1}</div>
              <div className="mt-3 text-lg font-bold">{step.title}</div>
              <p className="mt-2 text-sm text-white/65">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Solucoes por perfil</div>
        <h2 className="mt-2 text-2xl font-black">Escolha o caminho ideal para voce</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <Users size={18} />
              Familias
            </div>
            <p className="mt-3 text-sm text-white/65">Controle a despensa, receba alertas e reduza perdas em casa.</p>
            <Link
              to="/register"
              className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Plano Familia
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <Store size={18} />
              Restaurantes
            </div>
            <p className="mt-3 text-sm text-white/65">Gestao profissional de estoque com vitrine para vender excedentes.</p>
            <Link
              to="/register"
              className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Plano Restaurante
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <Handshake size={18} />
              Parceiros
            </div>
            <p className="mt-3 text-sm text-white/65">Ganhe visibilidade com anuncios aprovados e posicionamento premium.</p>
            <a
              href="#anuncie"
              className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Quero anunciar
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Modulos principais</div>
        <h2 className="mt-2 text-2xl font-black">Tecnologia aplicada ao desperdicio</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Despensa inteligente',
              text: 'Controle validade, categorias e prioridades com alertas claros.',
              icon: Package,
            },
            {
              title: 'Receitas inteligentes',
              text: 'Sugestoes baseadas no estoque atual para acelerar o giro.',
              icon: ChefHat,
            },
            {
              title: 'Marketplace de ofertas',
              text: 'Venda rapido com vitrine inteligente e alcance local.',
              icon: TrendingUp,
            },
            {
              title: 'Publicidade na plataforma',
              text: 'Visibilidade paga para marcas e parceiros relevantes.',
              icon: Gift,
            },
          ].map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <div className="flex items-center gap-3 text-emerald-200">
                  <Icon size={18} />
                  <span className="font-semibold">{module.title}</span>
                </div>
                <p className="mt-3 text-sm text-white/65">{module.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Ofertas em destaque</div>
            <h2 className="mt-2 text-2xl font-black">Produtos prontos para venda imediata</h2>
          </div>
          <Link
            to="/ofertas"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            Ver todas
          </Link>
        </div>

        {!featuredOffers.length ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
            Nenhuma oferta ativa no momento.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-amber-300">Ultima chance</div>
            <h2 className="mt-2 text-2xl font-black">Produtos proximos do vencimento</h2>
          </div>
          <Link
            to="/ofertas"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            Ver ofertas
          </Link>
        </div>

        {!lastChanceOffers.length ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
            Nao ha ofertas urgentes no momento.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lastChanceOffers.slice(0, 3).map((offer) => (
              <div key={offer.id} className="space-y-3">
                <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                  Ultima chance
                </div>
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="anuncie" className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Anuncie aqui</div>
            <h2 className="mt-2 text-2xl font-black">Visibilidade premium para parceiros</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/65">
              Posicione sua marca para familias e restaurantes que ja buscam economia e eficiencia.
            </p>
          </div>
          <Link to="/register" className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950">
            Quero anunciar
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-center gap-3 text-emerald-200">
            <Leaf size={18} />
            Anuncio patrocinado
          </div>
          <p className="mt-2 text-sm text-white/60">
            Espaco mensal aprovado pelo admin com destaque profissional na plataforma.
          </p>
        </div>
      </section>

      <section id="planos" className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Planos</div>
            <h2 className="mt-2 text-2xl font-black">Planos claros para cada perfil</h2>
          </div>
          <Link
            to="/planos"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            Ver detalhes
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Familias', text: 'Controle a despensa com alertas e economia real.' },
            { title: 'Restaurantes', text: 'Gestao profissional com vitrine de ofertas.' },
            { title: 'Anunciantes', text: 'Visibilidade paga com aprovacao da plataforma.' },
          ].map((plan) => (
            <div key={plan.title} className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <div className="text-lg font-bold">{plan.title}</div>
              <p className="mt-2 text-sm text-white/65">{plan.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-emerald-500/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Comece agora</div>
            <h2 className="mt-2 text-2xl font-black">Pronto para reduzir desperdicio e gerar valor?</h2>
          </div>
          <Link to="/register" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-950">
            Criar conta
          </Link>
        </div>
      </section>
    </div>
  );
}
