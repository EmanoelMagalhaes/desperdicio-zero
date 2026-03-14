import { Link } from 'react-router-dom';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function OfferCard({ offer }) {
  const price = formatCurrency(offer.price);
  const imageUrl = offer.imageUrl && offer.imageUrl.trim();

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
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">{offer.restaurantName}</div>
        <h3 className="mt-2 text-xl font-black">{offer.title}</h3>
        <p className="mt-2 text-sm text-white/70">{offer.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-emerald-200">{price}</div>
        <Link
          to={`/ofertas/${offer.id}`}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
