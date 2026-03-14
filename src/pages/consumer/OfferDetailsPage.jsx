import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function OfferDetailsPage() {
  const { id } = useParams();
  const { offers = [], addToCart, replaceCartWithOffer, cartWarning, clearCart } = useAppStore();
  const [pendingOffer, setPendingOffer] = useState(null);

  const offer = useMemo(() => offers.find((item) => item.id === id), [offers, id]);

  if (!offer) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
        Oferta nao encontrada. <Link to="/ofertas" className="text-emerald-300">Voltar para ofertas</Link>
      </div>
    );
  }

  const price = formatCurrency(offer.price);
  const imageUrl = offer.imageUrl && offer.imageUrl.trim();

  return (
    <div>
      <SectionTitle
        eyebrow={offer.restaurantName || 'Restaurante parceiro'}
        title={offer.title}
        text={offer.description}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900">
          {imageUrl ? (
            <img src={imageUrl} alt={offer.title} className="h-80 w-full object-cover" />
          ) : (
            <div className="flex h-80 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.35),transparent_60%)] text-sm text-white/45">
              Imagem indisponivel
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Detalhes da oferta</div>
          <div className="text-3xl font-black">{price}</div>

          <div className="space-y-2 text-sm text-white/70">
            <div>Categoria: {offer.category || 'Nao informado'}</div>
            <div>Disponibilidade: {offer.quantityAvailable ?? 'Nao informado'}</div>
            <div>Status: {offer.isActive === false ? 'Inativo' : 'Ativo'}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/70">
            Adicione ao pedido e finalize quando estiver pronto. O restaurante recebera sua solicitacao imediatamente.
          </div>

          {cartWarning ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
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

          <button
            onClick={() => {
              const result = addToCart(offer);
              if (result?.requiresConfirm) {
                setPendingOffer(offer);
              } else {
                setPendingOffer(null);
              }
            }}
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
          >
            Adicionar ao pedido
          </button>

          <Link
            to="/ofertas"
            className="inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
          >
            Voltar para ofertas
          </Link>
        </div>
      </div>
    </div>
  );
}
