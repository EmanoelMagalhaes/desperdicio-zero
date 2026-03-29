import { Link, useParams } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';

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

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow={content.eyebrow} title={content.title} text={content.text} />

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
