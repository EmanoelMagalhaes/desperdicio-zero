import { useMemo, useState } from 'react';
import { CheckCircle2, Megaphone, PauseCircle, PlayCircle, ShieldCheck, XCircle } from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';

function statusBadge(status) {
  if (status === 'approved') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }

  if (status === 'rejected') {
    return 'border-red-500/30 bg-red-500/10 text-red-200';
  }

  return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
}

function statusLabel(status) {
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Reprovado';
  return 'Pendente';
}

function formatDate(value) {
  if (!value) return 'Data indisponivel';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value?.toDate?.() || null;
  if (!date || Number.isNaN(date.getTime())) return 'Data indisponivel';
  return date.toLocaleDateString('pt-BR');
}

export default function AdminAdsPage() {
  const { ads, updateAdStatus } = useAppStore();
  const [updatingId, setUpdatingId] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const metrics = useMemo(() => {
    const total = ads.length;
    const pending = ads.filter((ad) => ad.status === 'pending').length;
    const approved = ads.filter((ad) => ad.status === 'approved').length;
    const active = ads.filter((ad) => ad.status === 'approved' && ad.isActive).length;
    return { total, pending, approved, active };
  }, [ads]);

  async function handleUpdate(adId, updates) {
    setUpdatingId(adId);
    setFeedback({ type: '', text: '' });
    const result = await updateAdStatus(adId, updates);
    setUpdatingId('');

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel atualizar o anuncio.' });
      return;
    }

    setFeedback({ type: 'success', text: 'Anuncio atualizado com sucesso.' });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Publicidade V1"
        title="Gerenciar anuncios patrocinados"
        text="Aprove anuncios e mantenha somente uma campanha ativa por anunciante."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total de anuncios" value={String(metrics.total)} icon={Megaphone} tone="blue" />
        <MetricCard label="Pendentes" value={String(metrics.pending)} icon={ShieldCheck} tone="amber" />
        <MetricCard label="Aprovados" value={String(metrics.approved)} icon={CheckCircle2} tone="emerald" />
        <MetricCard label="Ativos" value={String(metrics.active)} icon={PlayCircle} tone="emerald" />
      </div>

      {feedback.text ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
              : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Campanhas</div>
            <h2 className="mt-2 text-2xl font-black">Solicitacoes de anuncio</h2>
          </div>
          <div className="text-sm text-white/60">1 campanha ativa por anunciante</div>
        </div>

        <div className="mt-6 space-y-4">
          {ads.length ? (
            ads.map((ad) => (
              <div key={ad.id} className="rounded-[28px] border border-white/10 bg-neutral-900 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Patrocinado</div>
                    <div className="mt-2 text-xl font-black">{ad.title}</div>
                    <div className="mt-1 text-sm text-white/60">{ad.description}</div>
                    <div className="mt-2 text-sm text-white/50">
                      {ad.advertiserName || 'Anunciante'} · {formatDate(ad.updatedAt || ad.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusBadge(ad.status)}`}>
                      {statusLabel(ad.status)}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                      {ad.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUpdate(ad.id, { status: 'approved', isActive: true })}
                    disabled={updatingId === ad.id}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleUpdate(ad.id, { status: 'rejected', isActive: false })}
                    disabled={updatingId === ad.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reprovar
                  </button>
                  <button
                    onClick={() => handleUpdate(ad.id, { isActive: !ad.isActive })}
                    disabled={updatingId === ad.id || ad.status !== 'approved'}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    {ad.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    {ad.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
              Nenhuma solicitacao de anuncio recebida.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
