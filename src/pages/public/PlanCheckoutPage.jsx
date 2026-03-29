import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';
import { findPlanById } from '../../data/plansCatalog';

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PlanCheckoutPage() {
  const { planId } = useParams();
  const plan = useMemo(() => findPlanById(planId), [planId]);
  const { session, startPlanSubscription } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  if (!plan) {
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Assinatura"
          title="Plano nao encontrado"
          text="Escolha um plano valido para continuar a assinatura."
        />
        <Link
          to="/planos"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Voltar aos planos
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Assinatura"
          title="Entre para continuar"
          text="Faca login para concluir a assinatura do plano selecionado."
        />
        <Link
          to="/login"
          className="inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    setFeedback({ type: '', text: '' });
    setLoading(true);

    const result = await startPlanSubscription(plan);
    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel iniciar a assinatura.' });
      return;
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }

    setFeedback({
      type: 'info',
      text: 'Pagamento ainda nao configurado. A assinatura foi registrada como pendente.',
    });
    navigate('/assinatura/pendente');
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Assinatura"
        title="Confirmar plano escolhido"
        text="Revise os detalhes e finalize com Mercado Pago quando estiver pronto."
      />

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Plano selecionado</div>
            <h2 className="mt-2 text-2xl font-black">{plan.name}</h2>
            <div className="mt-2 text-sm text-white/60">{plan.limit}</div>
          </div>
          <div className="text-2xl font-black text-emerald-200">{formatCurrency(plan.priceValue)}</div>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-white/70">
          {plan.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-950 transition disabled:opacity-60"
          >
            {loading ? 'Iniciando...' : 'Pagar com Mercado Pago'}
          </button>
          <Link
            to="/planos"
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            Trocar plano
          </Link>
        </div>

        {feedback.text ? (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              feedback.type === 'error'
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
                : 'border border-white/10 bg-white/[0.04] text-white/70'
            }`}
          >
            {feedback.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
