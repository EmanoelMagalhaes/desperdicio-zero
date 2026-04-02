import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

function isValidImageUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatPriceForInput(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace('.', ',');
}

function sanitizePriceInput(value) {
  return value.replace(/[^\d.,]/g, '');
}

function parsePrice(value) {
  if (!value) return NaN;
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function OfferFormPage({ returnPath = '/restaurante/ofertas' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurantOffers, createRestaurantOffer, updateRestaurantOffer } = useAppStore();

  const offer = useMemo(
    () => restaurantOffers.find((item) => item.id === id),
    [restaurantOffers, id]
  );

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantityAvailable: '',
    imageUrl: '',
    isActive: true,
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!offer) return;

    setForm({
      title: offer.title || '',
      description: offer.description || '',
      category: offer.category || '',
      price: formatPriceForInput(offer.price),
      quantityAvailable: offer.quantityAvailable ?? '',
      imageUrl: offer.imageUrl || '',
      isActive: offer.isActive !== false,
    });
  }, [offer]);

  async function handleSubmit() {
    const parsedPrice = parsePrice(form.price);

    if (!form.title || !form.price || Number.isNaN(parsedPrice)) {
      setFeedback({ type: 'error', text: 'Informe nome e preco da oferta.' });
      return;
    }

    if (!isValidImageUrl(form.imageUrl)) {
      setFeedback({ type: 'error', text: 'Informe um link valido (http ou https) para a imagem.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: parsedPrice,
      quantityAvailable: form.quantityAvailable ? Number(form.quantityAvailable) : null,
      imageUrl: form.imageUrl || '',
      isActive: form.isActive,
    };

    const result = offer
      ? await updateRestaurantOffer(offer.id, payload)
      : await createRestaurantOffer(payload);

    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel salvar a oferta.' });
      return;
    }

    navigate(returnPath, { replace: true });
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Oferta"
        title={offer ? 'Editar oferta' : 'Nova oferta'}
        text="Preencha os dados da oferta para publicar na vitrine."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="space-y-4">
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Nome da oferta"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Descricao da oferta"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/70">Categoria</span>
                <input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="Categoria"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/70">Preco (R$)</span>
                <input
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: sanitizePriceInput(event.target.value) })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="0,00"
                  type="text"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/70">Quantidade disponivel</span>
                <input
                  value={form.quantityAvailable}
                  onChange={(event) => setForm({ ...form, quantityAvailable: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="Quantidade disponivel"
                  type="number"
                  min="0"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white/70">
                <span>Oferta ativa</span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 accent-emerald-400"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Imagem (link)</label>
              <input
                value={form.imageUrl}
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white/70"
                placeholder="https://..."
              />
              <div className="text-xs text-white/50">
                Use um link publico (http/https). Upload direto sera habilitado quando o Storage estiver ativo.
              </div>
              {form.imageUrl ? (
                <button
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                  className="text-xs text-amber-200 hover:text-amber-100"
                >
                  Remover imagem
                </button>
              ) : null}
            </div>
          </div>

          {feedback.text ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                feedback.type === 'error'
                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
                  : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              }`}
            >
              {feedback.text}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar oferta'}
            </button>
            <Link
              to={returnPath}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Cancelar
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Preview</div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview da oferta" className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-white/50">
                Nenhuma imagem selecionada
              </div>
            )}
          </div>
          <div className="mt-4 text-lg font-semibold">{form.title || 'Nome da oferta'}</div>
          <div className="mt-2 text-sm text-white/65">
            {form.description || 'Descricao da oferta'}
          </div>
        </div>
      </div>
    </div>
  );
}
