import { LogOut, Shield, User } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

export default function AppShell({ menuItems, subtitle }) {
  const { session, pendingCount, logout, activeClient } = useAppStore();

  const sessionLabel = session?.role === 'admin' ? 'Administrador' : 'Cliente';
  const contextLabel = session?.role === 'admin' && activeClient
    ? `Cliente ativo: ${activeClient.name}`
    : subtitle;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-neutral-950/90 lg:flex">
          <div className="border-b border-white/10 p-6">
            <div className="text-2xl font-black tracking-tight">Desperdicio Zero</div>
            <div className="mt-1 text-sm text-emerald-300">Cozinha Inteligente</div>
          </div>

          <div className="flex-1 p-4">
            <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Sessao</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  {session?.role === 'admin' ? <Shield size={22} /> : <User size={22} />}
                </div>
                <div>
                  <div className="font-semibold">{session?.name}</div>
                  <div className="text-sm text-white/55">{sessionLabel}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        isActive
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-white/[0.03] text-white/75 hover:bg-white/[0.07] hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/80 transition hover:bg-white/[0.08]"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div>
                <div className="text-lg font-bold">Desperdicio Zero</div>
                <div className="text-sm text-white/55">{contextLabel}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
                  {pendingCount} item(ns) com atencao
                </div>
                <button
                  onClick={logout}
                  className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:scale-[1.02]"
                >
                  Sair
                </button>
              </div>
            </div>

            <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 lg:hidden md:px-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={`mobile-${item.to}`}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'border border-white/10 bg-white/[0.03] text-white/70'
                      }`
                    }
                  >
                    <Icon size={15} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}