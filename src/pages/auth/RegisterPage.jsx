import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

const initialForm = {
  profile: 'consumer',
  name: '',
  email: '',
  password: '',
  address: '',
  businessType: 'Restaurante',
};

function withTimeout(promise, timeoutMs = 15000) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: false,
          error: 'A requisicao demorou demais para responder. Tente novamente em alguns segundos.',
        });
      }, timeoutMs);
    }),
  ]);
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const { register, registerConsumer, backendMode } = useAppStore();
  const navigate = useNavigate();
  const isConsumer = form.profile === 'consumer';

  async function handleSubmit() {
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const result = await withTimeout(isConsumer ? registerConsumer(form) : register(form));

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }

      if (!isConsumer && result.requiresApproval) {
        navigate('/register/pending', {
          replace: true,
          state: { businessName: form.name },
        });
        return;
      }

      setFeedback({
        type: 'success',
        text: result.message || 'Conta criada com sucesso. Redirecionando...',
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          typeof error?.message === 'string' && error.message.trim()
            ? error.message
            : 'Nao foi possivel concluir o cadastro agora. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Cadastro de conta</div>
      <h1 className="mt-3 text-4xl font-black">Crie seu acesso ao Desperdicio Zero</h1>
      <p className="mt-3 text-white/70">
        Modo atual: {backendMode === 'firebase' ? 'Firebase (conta real)' : 'LocalStorage (modo local)'}.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setForm((prev) => ({ ...prev, profile: 'consumer' }))}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            isConsumer ? 'bg-emerald-500 text-neutral-950' : 'bg-white/[0.05] text-white/70'
          }`}
        >
          Consumidor final
        </button>
        <button
          onClick={() => setForm((prev) => ({ ...prev, profile: 'partner' }))}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            !isConsumer ? 'bg-emerald-500 text-neutral-950' : 'bg-white/[0.05] text-white/70'
          }`}
        >
          Estabelecimento parceiro
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/70">
        {isConsumer
          ? 'Crie uma conta para acompanhar ofertas e pedidos.'
          : 'Crie uma conta para operar seu estabelecimento e receber pedidos. Cadastros passam por aprovacao.'}
      </div>

      <div className="mt-6 space-y-4">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
          placeholder={isConsumer ? 'Nome completo' : 'Nome do estabelecimento'}
        />

        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        {isConsumer ? (
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
            placeholder="Endereco"
          />
        ) : (
          <select
            value={form.businessType}
            onChange={(event) => setForm({ ...form, businessType: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-400"
          >
            <option>Restaurante</option>
            <option>Lanchonete</option>
            <option>Cafeteria</option>
            <option>Mercado</option>
            <option>Outro</option>
          </select>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? 'Enviando cadastro...' : 'Criar cadastro'}
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
          Ja tenho conta
        </Link>
        <Link to="/admin/login" className="text-white/60 hover:text-white/80">
          Acesso administrativo
        </Link>
      </div>
    </div>
  );
}
