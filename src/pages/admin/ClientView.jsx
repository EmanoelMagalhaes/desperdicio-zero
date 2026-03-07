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