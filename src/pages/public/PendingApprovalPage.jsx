import { ArrowRight, ChefHat, Clock3, Package, ShoppingCart, Sparkles, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const serviceHighlights = [
  {
    icon: Package,
    title: 'Gestao de estoque inteligente',
    text: 'Controle validade, itens criticos e prioridade de uso em um unico painel operacional.',
  },
  {
    icon: ChefHat,
    title: 'Receitas e acoes sugeridas',
    text: 'Transforme ingredientes em pratos e promocoes para reduzir perdas e aumentar giro.',
  },
  {
    icon: ShoppingCart,
    title: 'Compras com mais previsao',
    text: 'Monte listas mais assertivas para evitar compras duplicadas e excesso de pereciveis.',
  },
  {
    icon: Target,
    title: 'Desafios semanais de reducao',
    text: 'Engaje sua equipe com metas praticas para criar rotina de desperdicio zero.',
  },
];

export default function PendingApprovalPage() {
  const location = useLocation();
  const businessName = location.state?.businessName || '';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_28%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
              <Clock3 size={15} />
              Cadastro pendente de autorizacao
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Seu cadastro foi enviado e esta em <span className="text-emerald-400">analise e verificacao</span>.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              {businessName
                ? `${businessName}, confira seu e-mail para validar o cadastro. Depois da validacao, aguarde a aprovacao do administrador para liberar seu acesso.`
                : 'Confira seu e-mail para validar o cadastro. Depois da validacao, aguarde a aprovacao do administrador para liberar seu acesso.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-neutral-950"
              >
                Ir para login
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/"
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white/85 transition hover:bg-white/[0.05]"
              >
                Voltar para home
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/30">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">
              <Sparkles size={13} />
              Proximos passos
            </div>

            <div className="space-y-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                1. Confirme seu e-mail pelo link que enviamos.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                2. O administrador revisa e aprova seu cadastro.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                3. Com a aprovacao, seu login de estabelecimento parceiro e liberado.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="mb-6">
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Enquanto aguarda</div>
          <h2 className="mt-2 text-3xl font-black">Conheca os servicos do Desperdicio Zero</h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Nossa plataforma foi desenhada para reduzir perdas, melhorar margem e apoiar decisoes operacionais em cozinhas comerciais.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {serviceHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <div className="mb-3 inline-flex rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <Icon size={18} />
                </div>
                <div className="text-lg font-bold">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-white/70">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
