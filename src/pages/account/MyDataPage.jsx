import { useEffect, useMemo, useState } from 'react';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

function roleLabel(role) {
  if (role === 'admin') return 'Administrador';
  if (role === 'consumer') return 'Consumidor';
  if (role === 'restaurant') return 'Restaurante';
  return 'Cliente';
}

export default function MyDataPage() {
  const { session, updateUserProfile } = useAppStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Restaurante',
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const isPartner = useMemo(
    () => session?.role === 'client' || session?.role === 'restaurant',
    [session?.role]
  );

  useEffect(() => {
    if (!session) return;

    setForm({
      name: session.name || '',
      email: session.email || '',
      phone: session.phone || '',
      address: session.address || '',
      businessType: session.businessType || 'Restaurante',
    });
  }, [session]);

  async function handleSave() {
    if (!form.name.trim() || !form.address.trim()) {
      setFeedback({ type: 'error', text: 'Informe nome e endereco para salvar.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      name: form.name.trim(),
      phone: form.phone,
      address: form.address.trim(),
    };

    if (isPartner) {
      payload.businessType = form.businessType;
    }

    const result = await updateUserProfile(payload);
    setLoading(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel salvar seus dados.' });
      return;
    }

    setFeedback({ type: 'success', text: 'Dados atualizados com sucesso.' });
  }

  if (!session) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white/70">
        Nao foi possivel carregar seus dados. Faça login novamente.
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Conta"
        title="Meus dados"
        text="Revise e atualize suas informacoes pessoais e de contato."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm text-white/70">Nome</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                placeholder="Seu nome"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">E-mail</span>
              <input
                value={form.email}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-white/60"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/70">Telefone</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value.replace(/[^\d]/g, '') })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="Apenas numeros"
                  inputMode="numeric"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/70">Perfil</span>
                <input
                  value={roleLabel(session.role)}
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-white/60"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Endereco</span>
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
                placeholder="Endereco completo"
              />
            </label>

            {isPartner ? (
              <label className="space-y-2">
                <span className="text-sm text-white/70">Tipo de estabelecimento</span>
                <select
                  value={form.businessType}
                  onChange={(event) => setForm({ ...form, businessType: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400"
                >
                  <option>Restaurante</option>
                  <option>Lanchonete</option>
                  <option>Cafeteria</option>
                  <option>Mercado</option>
                  <option>Outro</option>
                </select>
              </label>
            ) : null}

            {session.role === 'client' ? (
              <div className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-white/60">
                Status do cadastro: {session.approvalStatus || 'approved'}
              </div>
            ) : null}
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

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar dados'}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white/70">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Seguranca</div>
          <p className="mt-3 text-sm text-white/65">
            Seu e-mail e perfil sao somente leitura nesta versao. Para mudar essas informacoes,
            entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
