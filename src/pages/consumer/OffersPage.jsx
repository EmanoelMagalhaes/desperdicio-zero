import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import OfferCard from '../../components/common/OfferCard';
import { useAppStore } from '../../hooks/useAppStore';

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
  } = useAppStore();
  const [pendingOffer, setPendingOffer] = useState(null);

  const activeOffers = offers.filter((offer) => offer.isActive !== false);

  return (
    <div>
      <SectionTitle
        eyebrow="Ofertas disponiveis"
        title="Escolha produtos de diferentes restaurantes"
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

      {!activeOffers.length && offersStatus !== 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Nenhuma oferta ativa no momento.
        </div>
      ) : null}

      {activeOffers.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activeOffers.map((offer) => (
            <div key={offer.id} className="space-y-3">
              <OfferCard offer={offer} />
              <button
                onClick={() => {
                  const result = addToCart(offer);
                  if (result?.requiresConfirm) {
                    setPendingOffer(offer);
                  } else {
                    setPendingOffer(null);
                  }
                }}
                className="w-full rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
              >
                Adicionar ao pedido
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
