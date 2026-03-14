import { Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function OffersListPage() {
  const {
    restaurantOffers = [],
    offersStatus,
    offersError,
    updateRestaurantOffer,
    deleteRestaurantOffer,
  } = useAppStore();

  async function handleToggle(offer) {
    await updateRestaurantOffer(offer.id, { isActive: !offer.isActive });
  }

  async function handleDelete(offerId) {
    await deleteRestaurantOffer(offerId);
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Ofertas do restaurante"
        title="Gerencie sua vitrine de produtos"
        text="Crie, edite e ative ofertas para reduzir desperdicio e aumentar o giro dos itens."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/60">
          {restaurantOffers.length} oferta(s) cadastrada(s)
        </div>
        <Link
          to="/restaurante/ofertas/nova"
          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Nova oferta
        </Link>
      </div>

      {offersStatus === 'error' ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {offersError || 'Nao foi possivel carregar as ofertas.'}
        </div>
      ) : null}

      {offersStatus === 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Carregando ofertas...
        </div>
      ) : null}

      {!restaurantOffers.length && offersStatus !== 'loading' ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
          Nenhuma oferta cadastrada ainda.
        </div>
      ) : null}

      <div className="space-y-4">
        {restaurantOffers.map((offer) => (
          <div key={offer.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {offer.category || 'Categoria'}
                </div>
                <div className="mt-2 text-xl font-black">{offer.title}</div>
                <div className="mt-1 text-sm text-white/60">{offer.description}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                  {offer.isActive ? 'Ativa' : 'Inativa'}
                </span>
                <span className="text-sm font-semibold text-emerald-200">{formatCurrency(offer.price)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/restaurante/ofertas/${offer.id}/editar`}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
              >
                Editar
              </Link>
              <button
                onClick={() => handleToggle(offer)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
              >
                {offer.isActive ? 'Inativar' : 'Ativar'}
              </button>
              <button
                onClick={() => handleDelete(offer.id)}
                className="rounded-2xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
