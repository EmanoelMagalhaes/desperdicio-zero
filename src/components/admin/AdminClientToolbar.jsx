export default function AdminClientToolbar({ clients, activeClient, selectedClientId, onSelectClient }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300">Acesso operacional do admin</div>
          <div className="mt-2 text-2xl font-black">Cliente em tempo real</div>
          <div className="mt-2 text-white/62">
            Selecione um cliente para navegar, cadastrar produtos e acompanhar compras e desafios.
          </div>
        </div>
        <div className="min-w-[280px]">
          <label className="mb-2 block text-sm text-white/55">Selecionar cliente</label>
          <select
            value={selectedClientId}
            onChange={(event) => onSelectClient(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-400"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.businessType}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeClient ? (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Visualizando como administrador: <span className="font-semibold">{activeClient.name}</span>.
        </div>
      ) : null}
    </div>
  );
}