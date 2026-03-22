import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Lock, ShieldCheck } from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import { useAppStore } from '../../hooks/useAppStore';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const { login, backendMode } = useAppStore();
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    setFeedback({ type: '', text: '' });

    const result = await login('admin', form.email, form.password);
    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }

    setFeedback({ type: 'success', text: 'Acesso administrativo liberado. Redirecionando...' });

    setTimeout(() => {
      navigate('/admin/dashboard', { replace: true });
    }, 350);
  }

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.18),transparent_28%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Acesso administrativo reservado
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Painel <span className="text-emerald-400">Administrador</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Modo atual: {backendMode === 'firebase' ? 'Firebase (auth real + banco online)' : 'LocalStorage (modo local)'}.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Supervisao" value="Global" icon={ShieldCheck} tone="emerald" />
            <MetricCard label="Acesso" value="Admin" icon={Lock} tone="blue" />
            <MetricCard label="Indicadores" value="Operacao" icon={BarChart3} tone="amber" />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="mb-6">
            <div className="text-2xl font-black">Login administrativo</div>
            <p className="mt-2 text-white/62">Use um usuario com role admin para acessar a supervisao.</p>
          </div>

          <div className="space-y-4">
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="E-mail"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Senha"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
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

          <div className="mt-5 flex flex-col gap-2 text-sm">
            <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
              Voltar para login publico
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
