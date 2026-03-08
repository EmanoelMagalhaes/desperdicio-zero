import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const { requestPasswordReset, backendMode } = useAppStore();

  async function handleSubmit() {
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const result = await requestPasswordReset(email.trim());

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }

      setFeedback({
        type: 'success',
        text:
          result.message ||
          'Se existir uma conta com este e-mail, enviamos o link de redefinicao de senha.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          typeof error?.message === 'string' && error.message.trim()
            ? error.message
            : 'Nao foi possivel enviar a recuperacao agora. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
        <KeyRound size={15} />
        Recuperacao de senha
      </div>

      <h1 className="mt-5 text-4xl font-black">Esqueci minha senha</h1>
      <p className="mt-3 text-white/70">
        Informe o e-mail da sua conta para receber o link de redefinicao.
      </p>
      <p className="mt-2 text-sm text-white/55">
        Modo atual: {backendMode === 'firebase' ? 'Firebase (envio real de e-mail)' : 'LocalStorage (simulacao local)'}.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block text-sm text-white/60">E-mail da conta</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-3.5 text-white/35" size={18} />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 outline-none placeholder:text-white/30 focus:border-emerald-400"
            placeholder="voce@empresa.com"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
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

      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
          Voltar para login
        </Link>
        <Link to="/register" className="text-white/65 hover:text-white/85">
          Criar nova conta
        </Link>
      </div>
    </div>
  );
}
