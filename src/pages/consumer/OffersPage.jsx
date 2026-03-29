import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import OfferCard from '../../components/common/OfferCard';
import { useAppStore } from '../../hooks/useAppStore';
import { resolveFeaturedOffers } from '../../utils/cms';

function isLastChance(offer) {
  return offer?.urgency === 'last' || offer?.isLastChance;
}

export default function OffersPage() {
  const {
    offers = [],
    offersStatus,
    offersError,
    cart,
    cartTotal,
    cartWarning,
    addToCart,
    replaceCartWithOffer,
    clearCart,
    cmsPublic,
  } = useAppStore();
  const [pendingOffer, setPendingOffer] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const activeOffers = offers.filter((offer) => offer.isActive !== false);

  const categories = useMemo(() => {
    const set = new Set(activeOffers.map((offer) => offer.category).filter(Boolean));
    return Array.from(set);
  }, [activeOffers]);

  const restaurants = useMemo(() => {
    const set = new Set(activeOffers.map((offer) => offer.restaurantName).filter(Boolean));
    return Array.from(set);
  }, [activeOffers]);

  function handleAdd(offer) {
    const result = addToCart(offer);
    if (result?.requiresConfirm) {
      setPendingOffer(offer);
    } else {
      setPendingOffer(null);
    }
  }

  const filteredOffers = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const filtered = activeOffers
      .filter((offer) => (searchText ? offer.title?.toLowerCase().includes(searchText) : true))
      .filter((offer) => (categoryFilter === 'all' ? true : offer.category === categoryFilter))
      .filter((offer) => (restaurantFilter === 'all' ? true : offer.restaurantName === restaurantFilter))
      .filter((offer) => (urgencyFilter === 'all' ? true : isLastChance(offer)));

    const sorted = [...filtered];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'recent') {
      sorted.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    } else {
      sorted.sort((a, b) => Number(isLastChance(b)) - Number(isLastChance(a)) || a.title.localeCompare(b.title));
    }

    return sorted;
  }, [activeOffers, search, categoryFilter, restaurantFilter, urgencyFilter, sortBy]);

  const featuredOffers = useMemo(() => resolveFeaturedOffers(filteredOffers, cmsPublic.featuredOffers, 4), [
    filteredOffers,
    cmsPublic.featuredOffers,
  ]);
  const lastChanceOffers = useMemo(() => filteredOffers.filter((offer) => isLastChance(offer)), [filteredOffers]);
  const featuredIds = new Set(featuredOffers.map((offer) => offer.id));
  const lastChanceIds = new Set(lastChanceOffers.map((offer) => offer.id));
  const mainOffers = filteredOffers.filter((offer) => !featuredIds.has(offer.id) && !lastChanceIds.has(offer.id));

  return (
    <div>
      <SectionTitle
        eyebrow="Ofertas disponiveis"
        title="Encontre ofertas por categoria, restaurante e urgencia"
        text="Explore as ofertas atuais e acompanhe o estoque antes de finalizar seu pedido."
      />

      {cart.items.length ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-sm text-white/70">
            Carrinho com {cart.items.length} item(ns) • Total:{' '}
            <span className="text-emerald-200">{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <Link
            to="/pedido"
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
          >
            Finalizar pedido
          </Link>
        </div>
      ) : null}

      {cartWarning ? (
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {cartWarning}
          {pendingOffer ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  clearCart();
                  replaceCartWithOffer(pendingOffer);
                  setPendingOffer(null);
                }}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
              >
                Limpar carrinho e adicionar
              </button>
              <button
                onClick={() => setPendingOffer(null)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80"
              >
                Manter carrinho atual
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
          placeholder="Buscar oferta"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={restaurantFilter}
          onChange={(event) => setRestaurantFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        >
          <option value="all">Todos os restaurantes</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant} value={restaurant}>
              {restaurant}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        >
          <option value="urgency">Ordenar por urgencia</option>
          <option value="recent">Mais recentes</option>
          <option value="price-asc">Menor preco</option>
          <option value="price-desc">Maior preco</option>
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setUrgencyFilter('all')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            urgencyFilter === 'all'
              ? 'bg-emerald-500 text-neutral-950'
              : 'border border-white/10 bg-white/[0.03] text-white/70'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setUrgencyFilter('last')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            urgencyFilter === 'last'
              ? 'bg-amber-500 text-neutral-950'
              : 'border border-white/10 bg-white/[0.03] text-white/70'
          }`}
        >
          Ultima chance
        </button>
      </div>

      {offersStatus === 'error' ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {offersError || 'Nao foi possivel carregar as ofertas agora.'}
        </div>
      ) : null}

      {offersStatus === 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Carregando ofertas...
        </div>
      ) : null}

      {featuredOffers.length ? (
        <section className="mb-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Destaques</div>
          <h2 className="mt-2 text-2xl font-black">Ofertas selecionadas para voce</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onAdd={handleAdd} />
            ))}
          </div>
        </section>
      ) : null}

      {lastChanceOffers.length ? (
        <section className="mb-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.22em] text-amber-300">Ultima chance</div>
          <h2 className="mt-2 text-2xl font-black">Produtos proximos do vencimento</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lastChanceOffers.slice(0, 3).map((offer) => (
              <OfferCard key={offer.id} offer={offer} onAdd={handleAdd} />
            ))}
          </div>
        </section>
      ) : null}

      {!filteredOffers.length && offersStatus !== 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Nenhuma oferta encontrada com os filtros selecionados.
        </div>
      ) : null}

      {mainOffers.length ? (
        <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Todas as ofertas</div>
          <h2 className="mt-2 text-2xl font-black">Grade completa de ofertas</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mainOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onAdd={handleAdd} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
