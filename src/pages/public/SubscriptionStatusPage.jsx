import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

const MAX_RECONCILE_ATTEMPTS = 6;
const RECONCILE_RETRY_DELAY_MS = 3500;
const RETRYABLE_REASONS = new Set([
  'provider-subscription-id-missing',
  'provider-subscription-not-found',
  'provider-subscription-not-found-by-external-reference',
]);

const STATUS_CONTENT = {
  sucesso: {
    eyebrow: 'Pagamento aprovado',
    title: 'Assinatura confirmada',
    text: 'Tudo certo! Sua assinatura foi confirmada e os recursos serão liberados em instantes.',
  },
  pendente: {
    eyebrow: 'Pagamento pendente',
    title: 'Assinatura aguardando confirmacao',
    text: 'Recebemos sua solicitacao. Assim que o pagamento for confirmado, o plano sera ativado.',
  },
  erro: {
    eyebrow: 'Pagamento nao concluido',
    title: 'Nao foi possivel finalizar',
    text: 'Houve um problema ao processar o pagamento. Tente novamente ou entre em contato.',
  },
};

export default function SubscriptionStatusPage() {
  const { status } = useParams();
  const content = STATUS_CONTENT[status] || STATUS_CONTENT.pendente;
  const [searchParams] = useSearchParams();
  const { session, reconcileSubscription } = useAppStore();
  const [syncState, setSyncState] = useState({ loading: false, message: '', error: '' });
  const subscriptionRef = useMemo(() => searchParams.get('subscription_ref') || '', [searchParams]);
  const preapprovalId = useMemo(() => searchParams.get('preapproval_id') || '', [searchParams]);

  useEffect(() => {
    if (!session) return;
    if (!subscriptionRef && !preapprovalId) return;

    let cancelled = false;
    let timerId = null;

    async function runReconcileAttempt(attempt) {
      if (cancelled) return;

      setSyncState({
        loading: true,
        message:
          attempt > 1 ? `Tentando sincronizar novamente (${attempt}/${MAX_RECONCILE_ATTEMPTS})...` : '',
        error: '',
      });

      const result = await reconcileSubscription({ subscriptionRef, preapprovalId });
      if (cancelled) return;

      if (!result?.ok) {
        setSyncState({
          loading: false,
          message: '',
          error: result?.error || 'Nao foi possivel atualizar o status da assinatura.',
        });
        return;
      }

      if (result?.reconciled) {
        setSyncState({
          loading: false,
          message: 'Assinatura sincronizada com sucesso.',
          error: '',
        });
        return;
      }

      const reason = String(result?.reason || '').trim().toLowerCase();
      const shouldRetry = RETRYABLE_REASONS.has(reason) && attempt < MAX_RECONCILE_ATTEMPTS;

      if (shouldRetry) {
        setSyncState({
          loading: true,
          message: 'Pagamento identificado. Aguardando confirmacao final da assinatura...',
          error: '',
        });
        timerId = window.setTimeout(() => {
          runReconcileAttempt(attempt + 1);
        }, RECONCILE_RETRY_DELAY_MS);
        return;
      }

      setSyncState({
        loading: false,
        message:
          'Assinatura registrada. Aguardando confirmacao do provedor de pagamento. Se o status nao mudar, atualize esta pagina em alguns minutos.',
        error: '',
      });
    }

    runReconcileAttempt(1);

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [session, subscriptionRef, preapprovalId, reconcileSubscription]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow={content.eyebrow} title={content.title} text={content.text} />

      {syncState.loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
          Sincronizando status da assinatura...
        </div>
      ) : null}

      {syncState.message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {syncState.message}
        </div>
      ) : null}

      {syncState.error ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {syncState.error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/planos"
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Ver planos
        </Link>
        <Link
          to="/"
          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
