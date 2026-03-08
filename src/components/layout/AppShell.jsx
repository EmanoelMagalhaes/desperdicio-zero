import { Download, LogOut, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

function feedbackTone(type) {
  if (type === 'error') {
    return 'border border-amber-500/20 bg-amber-500/10 text-amber-100';
  }

  return 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
}

export default function AppShell({ menuItems, subtitle }) {
  const { session, pendingCount, logout, activeClient, exportBackup } = useAppStore();
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const sessionLabel = session?.role === 'admin' ? 'Administrador' : 'Cliente';
  const contextLabel = session?.role === 'admin' && activeClient ? `Cliente ativo: ${activeClient.name}` : subtitle;

  async function handleExport() {
    try {
      const result = await exportBackup();

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error || 'Nao foi possivel exportar o backup.' });
      } else {
        setFeedback({ type: 'success', text: `Backup exportado: ${result.fileName}` });
      }
    } catch (error) {
      const errorMessage =
        typeof error?.message === 'string' && error.message.trim()
          ? error.message
          : 'Nao foi possivel exportar o backup.';
      setFeedback({ type: 'error', text: errorMessage });
    }

    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  }

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

          <div className="space-y-2 border-t border-white/10 p-4">
            <button
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/85 transition hover:bg-white/[0.08]"
            >
              <Download size={16} />
              Exportar backup
            </button>
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
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div className="min-w-0">
                <div className="text-base font-bold sm:text-lg">Desperdicio Zero</div>
                <div className="truncate text-xs text-white/55 sm:text-sm">{contextLabel}</div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 sm:block">
                  {pendingCount} item(ns) com atencao
                </div>

                <button
                  onClick={handleExport}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/85 sm:hidden"
                  aria-label="Exportar backup"
                  title="Exportar backup"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={logout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950 sm:hidden"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>

                <button
                  onClick={handleExport}
                  className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:inline-flex"
                >
                  Exportar backup
                </button>
                <button
                  onClick={logout}
                  className="hidden rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:scale-[1.02] sm:inline-flex"
                >
                  Sair
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-3 sm:hidden md:px-6">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                {pendingCount} item(ns) com atencao
              </div>
            </div>

            {feedback.text ? (
              <div className="mx-auto max-w-7xl px-4 pb-4 md:px-6">
                <div className={`rounded-2xl px-4 py-3 text-sm ${feedbackTone(feedback.type)}`}>{feedback.text}</div>
              </div>
            ) : null}
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 pb-[6.5rem] md:px-6 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-950/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`mobile-bottom-${item.to}`}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-white/55 hover:bg-white/[0.06] hover:text-white/85'
                  }`
                }
                aria-label={item.label}
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    <span className="sr-only">{item.label}</span>
                    {isActive ? <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-emerald-400" /> : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
