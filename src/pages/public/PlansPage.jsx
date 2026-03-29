import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';
import { PLAN_DATA, PLAN_TABS } from '../../data/plansCatalog';

function PlanCard({ plan, ctaLink, ctaLabel }) {
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
      <div className="mt-4 text-2xl font-black text-emerald-200">{plan.priceLabel}</div>
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
        to={ctaLink}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          plan.featured
            ? 'bg-emerald-500 text-neutral-950'
            : 'border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.08]'
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState('familia');
  const plans = useMemo(() => PLAN_DATA[activeTab] || [], [activeTab]);
  const { session } = useAppStore();

  const defaultDestination = useMemo(() => {
    if (!session) return '/register';
    if (session.role === 'consumer') return '/ofertas';
    if (session.role === 'admin') return '/admin/dashboard';
    return '/app/dashboard';
  }, [session]);

  function resolveCta(plan) {
    if (plan.priceValue > 0) {
      return {
        link: session ? `/planos/checkout/${plan.id}` : '/login',
        label: plan.cta,
      };
    }

    return {
      link: session ? defaultDestination : '/register',
      label: plan.cta,
    };
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Planos"
        title="Planos claros para cada perfil"
        text="Escolha o plano ideal para sua rotina, seu restaurante ou sua marca."
      />

      <div className="flex flex-wrap gap-2">
        {PLAN_TABS.map((tab) => (
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
        {plans.map((plan) => {
          const cta = resolveCta(plan);
          return <PlanCard key={plan.id} plan={plan} ctaLink={cta.link} ctaLabel={cta.label} />;
        })}
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 text-sm text-white/65">
        Pagamentos online serao ativados em breve. Ate la, o time pode ajudar a configurar o melhor plano para voce.
      </div>
    </div>
  );
}
