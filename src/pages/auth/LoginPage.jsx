import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import { BarChart3, CheckCircle2, Lock } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export default function LoginPage() {
  const [mode, setMode] = useState('client');
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const { login, backendMode } = useAppStore();
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    setFeedback({ type: '', text: '' });

    const result = await login(mode, form.email, form.password);
    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }

    setFeedback({ type: 'success', text: 'Acesso liberado. Redirecionando...' });

    setTimeout(() => {
      navigate(mode === 'admin' ? '/admin/dashboard' : '/app/dashboard', { replace: true });
    }, 350);
  }

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.18),transparent_28%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Plataforma profissional com areas publicas, cliente e admin
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Entre no <span className="text-emerald-400">Desperdicio Zero</span> e gerencie sua operacao.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Modo atual: {backendMode === 'firebase' ? 'Firebase (auth real + banco online)' : 'LocalStorage (modo local)'}.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Modulos" value="6 telas" icon={BarChart3} tone="emerald" />
            <MetricCard label="Acesso" value="Cliente + Admin" icon={Lock} tone="blue" />
            <MetricCard
              label="Persistencia"
              value={backendMode === 'firebase' ? 'Firebase' : 'LocalStorage'}
              icon={CheckCircle2}
              tone="amber"
            />
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-lg font-bold">Perfis de acesso</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                <div className="mb-2 text-sm font-semibold text-emerald-300">Cliente</div>
                <div className="text-sm text-white/70">Use o cadastro para criar sua conta real de operacao.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                <div className="mb-2 text-sm font-semibold text-emerald-300">Administrador</div>
                <div className="text-sm text-white/70">Requer usuario com role admin no Firestore.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setMode('client');
                setFeedback({ type: '', text: '' });
              }}
              className={`rounded-2xl px-4 py-2 font-semibold transition ${
                mode === 'client' ? 'bg-emerald-500 text-neutral-950' : 'bg-white/[0.05] text-white/70'
              }`}
            >
              Area do cliente
            </button>
            <button
              onClick={() => {
                setMode('admin');
                setFeedback({ type: '', text: '' });
              }}
              className={`rounded-2xl px-4 py-2 font-semibold transition ${
                mode === 'admin' ? 'bg-emerald-500 text-neutral-950' : 'bg-white/[0.05] text-white/70'
              }`}
            >
              Area admin
            </button>
          </div>

          <div className="mb-6">
            <div className="text-2xl font-black">{mode === 'admin' ? 'Login administrativo' : 'Entrar na plataforma'}</div>
            <p className="mt-2 text-white/62">
              {mode === 'admin'
                ? 'Acompanhe indicadores e gerencie operacao dos clientes.'
                : 'Gerencie despensa, compras, receitas e desafios da sua operacao. Novos cadastros precisam de aprovacao administrativa.'}
            </p>
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

          {mode === 'client' ? (
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <Link to="/forgot-password" className="text-white/70 hover:text-white">
                Esqueci minha senha
              </Link>
              <Link to="/register" className="text-emerald-300 hover:text-emerald-200">
                Criar nova conta de cliente
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
