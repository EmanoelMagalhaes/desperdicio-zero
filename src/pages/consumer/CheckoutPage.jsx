import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import CartItemRow from '../../components/common/CartItemRow';
import { useAppStore } from '../../hooks/useAppStore';
import { getUserProfile } from '../../services/firebaseDataService';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';

  const area = digits.slice(0, 2);
  const middle = digits.slice(2, 7);
  const last = digits.slice(7, 11);

  if (digits.length <= 2) return `(${area}`;
  if (digits.length <= 7) return `(${area}) ${digits.slice(2)}`;
  return `(${area}) ${middle}${last ? `-${last}` : ''}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartWarning,
    updateCartItem,
    removeFromCart,
    clearCart,
    createOrder,
    session,
    state,
    backendMode,
  } = useAppStore();

  const paymentOptions = ['Cartão', 'Pix', 'Dinheiro'];
  const [form, setForm] = useState({
    consumerName: '',
    consumerPhone: '',
    consumerEmail: '',
    receivingMethod: 'retirada',
    deliveryAddress: '',
    paymentMethod: '',
    notes: '',
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  useEffect(() => {
    if (session?.role !== 'consumer') return;
    setForm((prev) => ({
      ...prev,
      consumerName: prev.consumerName || session.name || '',
      consumerEmail: prev.consumerEmail || session.email || '',
    }));
  }, [session]);

  useEffect(() => {
    if (form.receivingMethod !== 'retirada') return;
    if (!cart.restaurantId) {
      setPickupAddress('');
      return;
    }

    if (backendMode !== 'firebase') {
      const localRestaurant = (state.clientAccounts || []).find((item) => item.id === cart.restaurantId);
      setPickupAddress(localRestaurant?.address || '');
      return;
    }

    let active = true;

    getUserProfile(cart.restaurantId)
      .then((profile) => {
        if (!active) return;
        setPickupAddress(profile?.address || '');
      })
      .catch(() => {
        if (!active) return;
        setPickupAddress('');
      })

    return () => {
      active = false;
    };
  }, [form.receivingMethod, cart.restaurantId, backendMode, state.clientAccounts]);

  const totalLabel = useMemo(() => formatCurrency(cartTotal), [cartTotal]);

  async function handleSubmit() {
    if (!form.consumerName || !form.consumerPhone || !form.consumerEmail) {
      setFeedback({ type: 'error', text: 'Preencha nome, WhatsApp e e-mail.' });
      return;
    }

    if (!paymentOptions.includes(form.paymentMethod)) {
      setFeedback({ type: 'error', text: 'Selecione a forma de pagamento.' });
      return;
    }

    if (form.receivingMethod === 'entrega' && !form.deliveryAddress) {
      setFeedback({ type: 'error', text: 'Informe o endereco para entrega.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });

    const result = await createOrder(form);
    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel enviar o pedido.' });
      return;
    }

    navigate('/pedido/sucesso', { replace: true, state: { orderId: result.order?.id } });
  }

  if (!cart.items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
        Seu carrinho esta vazio. <Link to="/ofertas" className="text-emerald-300">Voltar para ofertas</Link>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Finalizar pedido"
        title="Revise seus itens e envie o pedido"
        text={`Restaurante: ${cart.restaurantName || 'Selecionado'}`}
      />

      {cartWarning ? (
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {cartWarning}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.offerId}
              item={item}
              onIncrease={() => updateCartItem(item.offerId, item.quantity + 1)}
              onDecrease={() => updateCartItem(item.offerId, item.quantity - 1)}
              onRemove={() => removeFromCart(item.offerId)}
            />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-white/70">
            <span>Total</span>
            <span className="text-lg font-semibold text-emerald-200">{totalLabel}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={clearCart}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Limpar carrinho
            </button>
            <Link
              to="/ofertas"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Adicionar mais itens
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Dados do pedido</div>

          <div className="mt-4 space-y-4">
            <input
              value={form.consumerName}
              onChange={(event) => setForm({ ...form, consumerName: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Nome completo"
            />
            <input
              value={form.consumerPhone}
              onChange={(event) =>
                setForm({ ...form, consumerPhone: formatPhone(event.target.value) })
              }
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="WhatsApp"
            />
            <input
              value={form.consumerEmail}
              onChange={(event) => setForm({ ...form, consumerEmail: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="E-mail"
            />

            <select
              value={form.receivingMethod}
              onChange={(event) => setForm({ ...form, receivingMethod: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400"
            >
              <option value="retirada">Retirada</option>
              <option value="entrega">Entrega</option>
            </select>

            {form.receivingMethod === 'retirada' ? (
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/70">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Endereco de retirada</div>
                <div className="mt-2 text-white/80">
                  {pickupAddress || 'Endereco nao informado'}
                </div>
              </div>
            ) : null}

            {form.receivingMethod === 'entrega' ? (
              <input
                value={form.deliveryAddress}
                onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                placeholder="Endereco para entrega"
              />
            ) : null}

            <select
              value={form.paymentMethod}
              onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
            >
              <option value="">Forma de pagamento</option>
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Observacoes (opcional)"
            />
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
