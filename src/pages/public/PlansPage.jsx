import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';

const TABS = [
  { id: 'familia', label: 'Familia' },
  { id: 'restaurante', label: 'Restaurante' },
  { id: 'anuncio', label: 'Anuncios' },
];

const PLAN_DATA = {
  familia: [
    {
      id: 'familia-essencial',
      name: 'Familia Essencial',
      price: 'Gratis',
      badge: 'Comece sem custo',
      limit: 'Ate 50 produtos',
      highlights: ['Despensa inteligente', 'Alertas simples', 'Base para receitas futuras'],
      cta: 'Criar conta gratuita',
    },
    {
      id: 'familia-plus',
      name: 'Familia Plus',
      price: 'R$ 24,99/mês',
      badge: 'Ilimitado',
      limit: 'Produtos ilimitados',
      highlights: ['Alertas avancados', 'Receitas inteligentes (em breve)', 'Historico completo'],
      cta: 'Desbloquear ilimitado',
      featured: true,
    },
  ],
  restaurante: [
    {
      id: 'gestao-start',
      name: 'Gestao Start',
      price: 'Gratis',
      badge: 'Entrada',
      limit: 'Ate 50 produtos',
      highlights: ['Controle basico de estoque', 'Alertas simples', 'Sem publicacao de ofertas'],
      cta: 'Comecar gratis',
    },
    {
      id: 'gestao-plus',
      name: 'Gestao Plus',
      price: 'R$ 24,99/mês',
      badge: 'Gestao completa',
      limit: 'Produtos ilimitados',
      highlights: ['Alertas avancados', 'Prioridades operacionais', 'Sem marketplace'],
      cta: 'Desbloquear ilimitado',
    },
    {
      id: 'marketplace-flex',
      name: 'Marketplace Flex',
      price: 'R$ 49,99/mês + 10%',
      badge: 'Vitrine',
      limit: 'Produtos ilimitados',
      highlights: ['Publicacao de ofertas', 'Comissao padrao', 'Ideal para testar vendas'],
      cta: 'Ativar Marketplace Flex',
      featured: true,
    },
    {
      id: 'marketplace-pro',
      name: 'Marketplace Pro',
      price: 'R$ 98,99/mês + 5%',
      badge: 'Escala',
      limit: 'Produtos ilimitados',
      highlights: ['Comissao reduzida', 'Prioridade futura', 'Ideal para alto volume'],
      cta: 'Ativar Marketplace Pro',
    },
  ],
  anuncio: [
    {
      id: 'anuncio-standard',
      name: 'Anuncio Standard',
      price: 'R$ 149,99/mês',
      badge: 'Visibilidade',
      limit: '1 espaco ativo',
      highlights: ['Banner mensal aprovado', 'Destaque na home', 'Segmentacao futura'],
      cta: 'Anunciar na plataforma',
      featured: true,
    },
  ],
};

function PlanCard({ plan }) {
  return (
    <div
      className={`rounded-[28px] border p-6 ${
        plan.featured
          ? 'border-emerald-500/40 bg-emerald-500/10 shadow-2xl shadow-emerald-500/10'
          : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{plan.name}</div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{plan.badge}</span>
      </div>
      <div className="mt-4 text-2xl font-black text-emerald-200">{plan.price}</div>
      <div className="mt-2 text-sm text-white/60">{plan.limit}</div>

      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {plan.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          plan.featured
            ? 'bg-emerald-500 text-neutral-950'
            : 'border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.08]'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState('familia');
  const plans = useMemo(() => PLAN_DATA[activeTab] || [], [activeTab]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Planos"
        title="Planos claros para cada perfil"
        text="Escolha o plano ideal para sua rotina, seu restaurante ou sua marca."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-neutral-950'
                : 'border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.08]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${activeTab === 'restaurante' ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2'}`}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 text-sm text-white/65">
        Pagamentos online serao ativados em breve. Ate la, o time pode ajudar a configurar o melhor plano para voce.
      </div>
    </div>
  );
}
