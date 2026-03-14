import SectionTitle from '../../components/common/SectionTitle';
import OfferCard from '../../components/common/OfferCard';
import { useAppStore } from '../../hooks/useAppStore';

export default function OffersPage() {
  const { offers = [], offersStatus, offersError } = useAppStore();

  const activeOffers = offers.filter((offer) => offer.isActive !== false);

  return (
    <div>
      <SectionTitle
        eyebrow="Ofertas disponiveis"
        title="Escolha produtos de diferentes restaurantes"
        text="Explore as ofertas atuais e acompanhe o estoque antes de finalizar seu pedido."
      />

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
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
