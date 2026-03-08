import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

const initialForm = {
  name: '',
  email: '',
  password: '',
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

  const { register, backendMode } = useAppStore();
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const result = await withTimeout(register(form));

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }

      const successMessage =
        result.message ||
        (result.requiresApproval
          ? 'Cadastro enviado para analise e pendente de autorizacao de um administrador.'
          : 'Conta criada com sucesso. Redirecionando...');

      setFeedback({ type: 'success', text: successMessage });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, result.requiresApproval ? 1800 : 500);
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
      <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Cadastro de cliente</div>
      <h1 className="mt-3 text-4xl font-black">Crie sua conta para comecar a operar</h1>
      <p className="mt-3 text-white/70">
        Modo atual: {backendMode === 'firebase' ? 'Firebase (conta real)' : 'LocalStorage (modo local)'}.
      </p>

      <div className="mt-8 space-y-4">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
          placeholder="Nome do estabelecimento"
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

      <Link to="/login" className="mt-5 inline-block text-sm text-emerald-300 hover:text-emerald-200">
        Ja tenho conta
      </Link>
    </div>
  );
}
