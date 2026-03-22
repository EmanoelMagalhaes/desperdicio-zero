import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, ShieldPlus, Tag, Timer, UserPlus, XCircle } from 'lucide-react';
import AdminClientToolbar from '../../components/admin/AdminClientToolbar';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';
import { daysUntil } from '../../utils/date';

const initialClientForm = {
  name: '',
  email: '',
  password: '',
  businessType: 'Restaurante',
};

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

export default function ClientManager() {
  const {
    state,
    activeClient,
    adminSelectedClientId,
    setAdminSelectedClientId,
    createClientByAdmin,
    setClientApproval,
  } = useAppStore();

  const [form, setForm] = useState(initialClientForm);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [updatingClientId, setUpdatingClientId] = useState('');

  const clientSummary = useMemo(
    () =>
      state.clientAccounts.map((client) => ({
        ...client,
        approvalStatus: client.approvalStatus || 'pending',
        products: state.inventories[client.id]?.length || 0,
        shopping: state.shoppingLists[client.id]?.length || 0,
        critical: (state.inventories[client.id] || []).filter((item) => daysUntil(item.expiry) <= 2).length,
        orderCount: (state.orders || []).filter((order) => order.restaurantId === client.id).length,
        pendingOrders: (state.orders || []).filter(
          (order) => order.restaurantId === client.id && order.status === 'pending'
        ).length,
        activeOffers: (state.offers || []).filter(
          (offer) => offer.restaurantId === client.id && offer.isActive !== false
        ).length,
      })),
    [state]
  );

  const pendingClients = clientSummary.filter((client) => client.approvalStatus !== 'approved');
  const approvedClients = clientSummary.filter((client) => client.approvalStatus === 'approved');
  const selectedApprovedClientId = approvedClients.some((client) => client.id === adminSelectedClientId)
    ? adminSelectedClientId
    : approvedClients[0]?.id || '';
  const activeApprovedClient = activeClient && (activeClient.approvalStatus || 'approved') === 'approved'
    ? activeClient
    : null;

  async function handleCreateClient() {
    setFeedback({ type: '', text: '' });

    try {
      setLoadingCreate(true);
      const result = await createClientByAdmin(form);

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error || 'Nao foi possivel cadastrar o cliente.' });
        return;
      }

      setFeedback({ type: 'success', text: 'Cliente cadastrado com sucesso e liberado para acesso.' });
      setForm(initialClientForm);
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          typeof error?.message === 'string' && error.message.trim()
            ? error.message
            : 'Nao foi possivel cadastrar o cliente.',
      });
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleApproval(clientId, status) {
    setFeedback({ type: '', text: '' });

    try {
      setUpdatingClientId(clientId);
      const result = await setClientApproval(clientId, status);

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error || 'Nao foi possivel atualizar a aprovacao.' });
        return;
      }

      setFeedback({
        type: 'success',
        text: status === 'approved' ? 'Cliente aprovado com sucesso.' : 'Cliente marcado como reprovado.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          typeof error?.message === 'string' && error.message.trim()
            ? error.message
            : 'Nao foi possivel atualizar a aprovacao.',
      });
    } finally {
      setUpdatingClientId('');
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Gestao de clientes"
        title="Aprove cadastros e gerencie operacoes"
        text="Aprove ou reprove novos cadastros e crie clientes direto pela area administrativa."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-2 text-emerald-300">
            <ShieldPlus size={18} />
            <div className="text-sm font-semibold uppercase tracking-[0.18em]">Aprovacao de cadastros</div>
          </div>

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
              Nao ha cadastros pendentes no momento.
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-2 text-emerald-300">
            <UserPlus size={18} />
            <div className="text-sm font-semibold uppercase tracking-[0.18em]">Cadastrar cliente (admin)</div>
          </div>

          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Nome do estabelecimento"
            />
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="E-mail"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Senha inicial"
            />
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

            <button
              onClick={handleCreateClient}
              disabled={loadingCreate}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 disabled:opacity-60"
            >
              {loadingCreate ? 'Cadastrando...' : 'Cadastrar cliente'}
            </button>
          </div>
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

      <AdminClientToolbar
        clients={approvedClients}
        activeClient={activeApprovedClient}
        selectedClientId={selectedApprovedClientId}
        onSelectClient={setAdminSelectedClientId}
      />

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-300">Resumo por cliente</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientSummary.map((client) => (
            <div key={`summary-${client.id}`} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-base font-semibold">{client.name}</div>
                <span className={`rounded-full border px-3 py-1 text-xs ${statusBadge(client.approvalStatus)}`}>
                  {statusLabel(client.approvalStatus)}
                </span>
              </div>
              <div className="text-sm text-white/55">{client.businessType}</div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Pedidos</div>
                  <div className="font-semibold">{client.orderCount}</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Pendentes</div>
                  <div className="font-semibold">{client.pendingOrders}</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-2">
                  <div className="text-xs text-white/50">Ofertas</div>
                  <div className="font-semibold">{client.activeOffers}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} /> {client.orderCount} pedidos totais
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={14} /> {client.pendingOrders} pedidos pendentes
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={14} /> {client.activeOffers} ofertas ativas
                </div>
              </div>

              <Link
                to="/admin/cliente"
                onClick={() => setAdminSelectedClientId(client.id)}
                className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
              >
                Acessar ambiente
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-300">Indicadores operacionais</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientSummary.map((client) => (
            <div key={`cards-${client.id}`} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-base font-semibold">{client.name}</div>
                <span className={`rounded-full border px-3 py-1 text-xs ${statusBadge(client.approvalStatus)}`}>
                  {statusLabel(client.approvalStatus)}
                </span>
              </div>
              <div className="text-sm text-white/55">{client.businessType}</div>
              <div className="mt-4 space-y-2 text-sm text-white/75">
                <div>Pedidos: {client.orderCount}</div>
                <div>Ofertas ativas: {client.activeOffers}</div>
                <div>Pendentes: {client.pendingOrders}</div>
              </div>
              <Link
                to="/admin/cliente"
                onClick={() => setAdminSelectedClientId(client.id)}
                className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950"
              >
                Acessar ambiente
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
