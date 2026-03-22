import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Settings2, ShieldPlus, Tag, Timer, User, XCircle } from 'lucide-react';
import AdminClientToolbar from '../../components/admin/AdminClientToolbar';
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

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminCmsPage() {
  const {
    state,
    activeClient,
    adminSelectedClientId,
    setAdminSelectedClientId,
    setClientApproval,
    restaurantOffers = [],
    offersStatus,
    offersError,
    updateRestaurantOffer,
    deleteRestaurantOffer,
  } = useAppStore();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [updatingClientId, setUpdatingClientId] = useState('');

  const clients = state.clientAccounts || [];
  const pendingClients = clients.filter((client) => (client.approvalStatus || 'pending') !== 'approved');
  const approvedClients = clients.filter((client) => (client.approvalStatus || 'pending') === 'approved');

  const selectedApprovedClientId = approvedClients.some((client) => client.id === adminSelectedClientId)
    ? adminSelectedClientId
    : approvedClients[0]?.id || '';

  useEffect(() => {
    if (selectedApprovedClientId && selectedApprovedClientId !== adminSelectedClientId) {
      setAdminSelectedClientId(selectedApprovedClientId);
    }
  }, [selectedApprovedClientId, adminSelectedClientId, setAdminSelectedClientId]);

  const cmsMetrics = useMemo(() => {
    const totalPartners = clients.length;
    const totalOrders = (state.orders || []).length;
    const activeOffers = (state.offers || []).filter((offer) => offer?.isActive !== false).length;
    return { totalPartners, totalOrders, activeOffers, pending: pendingClients.length };
  }, [clients, state.orders, state.offers, pendingClients.length]);

  async function handleApproval(clientId, status) {
    setFeedback({ type: '', text: '' });
    setUpdatingClientId(clientId);
    const result = await setClientApproval(clientId, status);
    setUpdatingClientId('');

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.error || 'Nao foi possivel atualizar a aprovacao.' });
      return;
    }

    setFeedback({
      type: 'success',
      text: status === 'approved' ? 'Cadastro aprovado com sucesso.' : 'Cadastro marcado como reprovado.',
    });
  }

  async function handleToggleOffer(offer) {
    await updateRestaurantOffer(offer.id, { isActive: !offer.isActive });
  }

  async function handleDeleteOffer(offerId) {
    await deleteRestaurantOffer(offerId);
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="CMS interno"
        title="Gestao central da plataforma"
        text="Organize cadastros, parceiros e vitrine de ofertas sem depender de ajustes no codigo."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Parceiros cadastrados" value={String(cmsMetrics.totalPartners)} icon={User} tone="emerald" />
        <MetricCard label="Cadastros pendentes" value={String(cmsMetrics.pending)} icon={ShieldPlus} tone="amber" />
        <MetricCard label="Total de pedidos" value={String(cmsMetrics.totalOrders)} icon={ClipboardList} tone="blue" />
        <MetricCard label="Ofertas ativas" value={String(cmsMetrics.activeOffers)} icon={Tag} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Acoes rapidas</div>
              <h2 className="mt-2 text-2xl font-black">Atalhos administrativos</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white/70">
              <Settings2 size={16} />
              CMS V1
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate('/admin/clientes')}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05]"
            >
              Gerenciar clientes
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05]"
            >
              Ver painel global
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-300">Cadastros pendentes</div>
          {pendingClients.length ? (
            <div className="space-y-3">
              {pendingClients.map((client) => (
                <div key={client.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{client.name}</div>
                      <div className="text-sm text-white/60">{client.email}</div>
                      <div className="text-sm text-white/50">{client.businessType}</div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusBadge(client.approvalStatus)}`}>
                      {statusLabel(client.approvalStatus)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApproval(client.id, 'approved')}
                      disabled={updatingClientId === client.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleApproval(client.id, 'rejected')}
                      disabled={updatingClientId === client.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Reprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Nenhum cadastro pendente no momento.
            </div>
          )}
        </div>
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
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Ofertas por parceiro</div>
            <h2 className="mt-2 text-2xl font-black">Gerenciar vitrine</h2>
          </div>
          <Link
            to="/admin/cms/ofertas/nova"
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
          >
            Nova oferta
          </Link>
        </div>

        <div className="mt-4">
          <AdminClientToolbar
            clients={approvedClients}
            activeClient={activeClient}
            selectedClientId={selectedApprovedClientId}
            onSelectClient={setAdminSelectedClientId}
          />
        </div>

        <div className="mt-5 text-sm text-white/60">
          {activeClient?.name ? `Parceiro ativo: ${activeClient.name}` : 'Selecione um parceiro para ver as ofertas.'}
        </div>

        {offersStatus === 'error' ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
            {offersError || 'Nao foi possivel carregar as ofertas.'}
          </div>
        ) : null}

        {offersStatus === 'loading' ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
            Carregando ofertas...
          </div>
        ) : null}

        {!restaurantOffers.length && offersStatus !== 'loading' ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/65">
            Nenhuma oferta cadastrada para este parceiro.
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {restaurantOffers.map((offer) => (
            <div key={offer.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    {offer.category || 'Categoria'}
                  </div>
                  <div className="mt-2 text-xl font-black">{offer.title}</div>
                  <div className="mt-1 text-sm text-white/60">{offer.description}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                    {offer.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-sm font-semibold text-emerald-200">{formatCurrency(offer.price)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/admin/cms/ofertas/${offer.id}/editar`}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleToggleOffer(offer)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
                >
                  {offer.isActive ? 'Inativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="rounded-2xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
