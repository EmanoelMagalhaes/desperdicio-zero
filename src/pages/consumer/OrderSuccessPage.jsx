import { Link, useLocation } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <SectionTitle
        eyebrow="Pedido enviado"
        title="Seu pedido foi registrado com sucesso"
        text="O restaurante ja recebeu sua solicitacao. Em breve voce recebera a confirmacao pelo WhatsApp."
      />

      {orderId ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
          Codigo do pedido: <span className="font-semibold">{orderId}</span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/ofertas"
          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Ver mais ofertas
        </Link>
        <Link
          to="/"
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Voltar para home
        </Link>
      </div>
    </div>
  );
}
