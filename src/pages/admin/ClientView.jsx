import { useState } from 'react';
import AdminClientToolbar from '../../components/admin/AdminClientToolbar';
import DashboardSection from '../../components/sections/DashboardSection';
import InventorySection from '../../components/sections/InventorySection';
import RecipesSection from '../../components/sections/RecipesSection';
import ShoppingSection from '../../components/sections/ShoppingSection';
import TipsSection from '../../components/sections/TipsSection';
import { useAppStore } from '../../hooks/useAppStore';

const tabs = [
  { key: 'dashboard', label: 'Home do cliente' },
  { key: 'inventory', label: 'Despensa' },
  { key: 'shopping', label: 'Compras' },
  { key: 'recipes', label: 'Receitas' },
  { key: 'tips', label: 'Desafios' },
];

export default function ClientView() {
  const [tab, setTab] = useState('dashboard');
  const {
    state,
    activeClient,
    adminSelectedClientId,
    setAdminSelectedClientId,
    inventory,
    shoppingList,
    challengeState,
    restaurantOrders,
    restaurantOffers,
    addInventory,
    deleteInventory,
    addShopping,
    toggleShopping,
    deleteShopping,
    toggleChallenge,
  } = useAppStore();

  function mapDashboardNavigation(path) {
    if (path.includes('/inventory')) setTab('inventory');
    if (path.includes('/recipes')) setTab('recipes');
  }

  return (
    <div className="space-y-6">
      <AdminClientToolbar
        clients={state.clientAccounts}
        activeClient={activeClient}
        selectedClientId={adminSelectedClientId}
        onSelectClient={setAdminSelectedClientId}
      />

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Visao do cliente</div>
            <div className="mt-2 text-2xl font-black">Resumo operacional</div>
            <div className="mt-2 text-sm text-white/60">
              Cliente ativo: <span className="text-white/85">{activeClient?.name || 'Selecionado'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Pedidos pendentes</div>
            <div className="mt-2 text-3xl font-black">
              {restaurantOrders.filter((order) => order.status === 'pending').length}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Em preparo</div>
            <div className="mt-2 text-3xl font-black">
              {restaurantOrders.filter((order) => order.status === 'preparing').length}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Pedidos prontos</div>
            <div className="mt-2 text-3xl font-black">
              {restaurantOrders.filter((order) => order.status === 'ready').length}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Total de pedidos</div>
            <div className="mt-2 text-3xl font-black">{restaurantOrders.length}</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Ofertas ativas</div>
            <div className="mt-2 text-3xl font-black">
              {restaurantOffers.filter((offer) => offer.isActive !== false).length}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-neutral-900 p-4">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Pedidos recentes</div>
          <div className="mt-3 space-y-3">
            {restaurantOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold">{order.consumerName || 'Consumidor'}</div>
                  <div className="text-xs text-white/55">{order.status}</div>
                </div>
                <div className="text-sm text-white/70">
                  R$ {Number(order.total || 0).toFixed(2)}
                </div>
              </div>
            ))}
            {!restaurantOrders.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60">
                Nenhum pedido recente.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
              tab === item.key
                ? 'bg-emerald-500 text-neutral-950'
                : 'border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? (
        <DashboardSection
          inventory={inventory}
          shoppingList={shoppingList}
          sessionName={activeClient?.name || 'Cliente selecionado'}
          onGoTo={mapDashboardNavigation}
          showOperational={false}
        />
      ) : null}

      {tab === 'inventory' ? (
        <InventorySection items={inventory} onAdd={addInventory} onDelete={deleteInventory} />
      ) : null}

      {tab === 'shopping' ? (
        <ShoppingSection
          list={shoppingList}
          onAdd={addShopping}
          onToggle={toggleShopping}
          onDelete={deleteShopping}
        />
      ) : null}

      {tab === 'recipes' ? <RecipesSection items={inventory} /> : null}

      {tab === 'tips' ? (
        <TipsSection challenges={challengeState} onToggleChallenge={toggleChallenge} />
      ) : null}
    </div>
  );
}
