import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import { BarChart3, CheckCircle2, Lock } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export default function LoginPage() {
  const [mode, setMode] = useState('client');
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const { login } = useAppStore();
  const navigate = useNavigate();

  function handleSubmit() {
    const result = login(mode, form.email, form.password);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    navigate(mode === 'admin' ? '/admin/dashboard' : '/app/dashboard', { replace: true });
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
            O MVP ja entrega autenticacao local, controle de estoque, compras, receitas sugeridas e desafios.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Modulos" value="6 telas" icon={BarChart3} tone="emerald" />
            <MetricCard label="Acesso" value="Cliente + Admin" icon={Lock} tone="blue" />
            <MetricCard label="Persistencia" value="LocalStorage" icon={CheckCircle2} tone="amber" />
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-lg font-bold">Acessos de demonstracao</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                <div className="mb-2 text-sm font-semibold text-emerald-300">Cliente</div>
                <div className="text-sm text-white/70">E-mail: cliente@desperdiciozero.com</div>
                <div className="text-sm text-white/70">Senha: 123456</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                <div className="mb-2 text-sm font-semibold text-emerald-300">Administrador</div>
                <div className="text-sm text-white/70">E-mail: admin@desperdiciozero.com</div>
                <div className="text-sm text-white/70">Senha: admin123</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setMode('client');
                setMessage('');
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
                setMessage('');
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
                : 'Gerencie despensa, compras, receitas e desafios da sua operacao.'}
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
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01]"
            >
              Entrar
            </button>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {message}
            </div>
          ) : null}

          {mode === 'client' ? (
            <Link to="/register" className="mt-5 block text-sm text-emerald-300 hover:text-emerald-200">
              Criar nova conta de cliente
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}