import { Link } from 'react-router-dom';
import AdminClientToolbar from '../../components/admin/AdminClientToolbar';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';
import { daysUntil } from '../../utils/date';

export default function ClientManager() {
  const { state, activeClient, adminSelectedClientId, setAdminSelectedClientId } = useAppStore();

  const clientSummary = state.clientAccounts.map((client) => ({
    ...client,
    products: state.inventories[client.id]?.length || 0,
    shopping: state.shoppingLists[client.id]?.length || 0,
    critical: (state.inventories[client.id] || []).filter((item) => daysUntil(item.expiry) <= 2).length,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Gestao de clientes"
        title="Selecione e acompanhe cada operacao"
        text="Aqui o administrador escolhe um cliente e acompanha o resumo de estoque, compras e itens criticos."
      />

      <AdminClientToolbar
        clients={state.clientAccounts}
        activeClient={activeClient}
        selectedClientId={adminSelectedClientId}
        onSelectClient={setAdminSelectedClientId}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientSummary.map((client) => (
          <div key={client.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-lg font-bold">{client.name}</div>
            <div className="text-sm text-white/60">{client.businessType}</div>
            <div className="mt-4 space-y-2 text-sm text-white/75">
              <div>Produtos: {client.products}</div>
              <div>Itens criticos: {client.critical}</div>
              <div>Itens de compra: {client.shopping}</div>
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
  );
}