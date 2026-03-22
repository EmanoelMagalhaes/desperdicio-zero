import { AlertTriangle, ChefHat, Mail, MapPin, Package, Phone, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import OfferCard from '../../components/common/OfferCard';
import { useAppStore } from '../../hooks/useAppStore';
import { recipeSuggestions } from '../../services/kitchenService';
import { daysUntil } from '../../utils/date';
import { resolveFeaturedOffers, sanitizeSectionsOrder } from '../../utils/cms';

export default function LandingPage() {
  const { demoInventory, demoShoppingList, offers, cmsPublic } = useAppStore();
  const demoRecipes = recipeSuggestions(demoInventory);
  const criticalCount = demoInventory.filter((item) => daysUntil(item.expiry) <= 2).length;
  const sectionsOrder = sanitizeSectionsOrder(cmsPublic.home.sectionsOrder);
  const sectionsEnabled = cmsPublic.home.sectionsEnabled || {};
  const activeBanners = (cmsPublic.banners || []).filter((banner) => banner?.enabled !== false);
  const highlights = cmsPublic.highlights || [];
  const featuredOffers = resolveFeaturedOffers(offers || [], cmsPublic.featuredOffers, 4);

  const heroSection = (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_28%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            {cmsPublic.home.hero.badge}
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            {cmsPublic.home.hero.titlePrefix}{' '}
            <span className="text-emerald-400">{cmsPublic.home.hero.titleHighlight}</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{cmsPublic.home.hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-neutral-950">
              {cmsPublic.home.hero.ctaPrimary}
            </Link>
            <Link
              to="/demo/kitchen"
              className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white/85 transition hover:bg-white/[0.05]"
            >
              {cmsPublic.home.hero.ctaSecondary}
            </Link>
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
  );

  const bannerSection = activeBanners.length ? (
    <section className="grid gap-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-2">
      {activeBanners.map((banner) => (
        <div key={banner.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="text-lg font-bold">{banner.title}</div>
          <p className="mt-2 text-sm text-white/65">{banner.text}</p>
          {banner.imageUrl ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img src={banner.imageUrl} alt={banner.title} className="h-40 w-full object-cover" />
            </div>
          ) : null}
          {banner.link ? (
            <Link
              to={banner.link}
              className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Saiba mais
            </Link>
          ) : null}
        </div>
      ))}
    </section>
  ) : null;

  const highlightsSection = highlights.length ? (
    <section className="grid gap-4 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-3">
      {highlights.map((item) => (
        <Link
          key={item.id}
          to={item.link || '/'}
          className="rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:bg-white/[0.05]"
        >
          <div className="text-lg font-bold">{item.title}</div>
          <p className="mt-2 text-sm text-white/65">{item.text}</p>
        </Link>
      ))}
    </section>
  ) : null;

  const offersSection = (
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
  );

  const contactSection = (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Contato rapido</div>
      <h2 className="mt-2 text-2xl font-black">Fale com a equipe Desperdicio Zero</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Mail size={16} />
            {cmsPublic.contact.email}
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
            <Phone size={16} />
            {cmsPublic.contact.phone}
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
            <Phone size={16} />
            {cmsPublic.contact.whatsapp}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-start gap-3 text-sm text-white/70">
            <MapPin size={16} className="mt-0.5" />
            <span>{cmsPublic.contact.address}</span>
          </div>
          <Link
            to="/register"
            className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
          >
            Quero conhecer a plataforma
          </Link>
        </div>
      </div>
    </section>
  );

  const sectionMap = {
    hero: heroSection,
    banner: bannerSection,
    highlights: highlightsSection,
    offers: offersSection,
    contact: contactSection,
  };

  return (
    <div className="space-y-8">
      {sectionsOrder
        .filter((key) => sectionsEnabled[key] !== false)
        .map((key) => (
          <div key={key}>{sectionMap[key]}</div>
        ))}
    </div>
  );
}
