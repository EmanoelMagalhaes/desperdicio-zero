import { Link } from 'react-router-dom';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function OfferCard({ offer, onAdd }) {
  const price = formatCurrency(offer.price);
  const originalPriceRaw = offer.originalPrice ?? offer.previousPrice ?? offer.listPrice ?? null;
  const originalPrice = originalPriceRaw !== null && originalPriceRaw !== undefined ? Number(originalPriceRaw) : null;
  const showOriginalPrice = Number.isFinite(originalPrice) && originalPrice > Number(offer.price || 0);
  const imageUrl = offer.imageUrl && offer.imageUrl.trim();
  const isLastChance = offer.urgency === 'last' || offer.isLastChance;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
        {imageUrl ? (
          <img src={imageUrl} alt={offer.title} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.35),transparent_60%)] text-sm text-white/45">
            Imagem indisponivel
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-300">
          <span>{offer.restaurantName}</span>
          {isLastChance ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">
              Ultima chance
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-xl font-black">{offer.title}</h3>
        <p className="mt-2 text-sm text-white/70">{offer.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
          {offer.category ? (
            <span className="rounded-full border border-white/10 px-2 py-0.5">{offer.category}</span>
          ) : null}
          {offer.type ? (
            <span className="rounded-full border border-white/10 px-2 py-0.5">{offer.type}</span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {showOriginalPrice ? (
            <div className="text-xs text-white/40 line-through">{formatCurrency(originalPrice)}</div>
          ) : null}
          <div className="text-lg font-semibold text-emerald-200">{price}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/ofertas/${offer.id}`}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            Ver detalhes
          </Link>
          {onAdd ? (
            <button
              onClick={() => onAdd(offer)}
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
            >
              Adicionar ao pedido
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
