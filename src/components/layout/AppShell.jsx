import { Download, LogOut, Menu, Shield, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { getRoleBottomNavItems } from '../navigation/roleNavConfig';

function feedbackTone(type) {
  if (type === 'error') {
    return 'border border-amber-500/20 bg-amber-500/10 text-amber-100';
  }

  return 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
}

export default function AppShell({
  menuItems,
  subtitle,
  showBackup = true,
  statusLabel = 'item(ns) com atencao',
  statusValue,
}) {
  const { session, pendingCount, logout, activeClient, exportBackup } = useAppStore();
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const sessionLabel =
    session?.role === 'admin'
      ? 'Administrador'
      : session?.role === 'consumer'
        ? 'Consumidor'
        : session?.role === 'restaurant'
          ? 'Restaurante'
          : 'Cliente';
  const contextLabel = session?.role === 'admin' && activeClient ? `Cliente ativo: ${activeClient.name}` : subtitle;
  const resolvedStatusValue = typeof statusValue === 'number' ? statusValue : pendingCount;
  const roleBottomNavItems = useMemo(() => getRoleBottomNavItems(session?.role), [session?.role]);
  const showRoleBottomNav = roleBottomNavItems.length > 0;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

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
            {showBackup ? (
              <button
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/85 transition hover:bg-white/[0.08]"
              >
                <Download size={16} />
                Exportar backup
              </button>
            ) : null}
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
          <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-neutral-950/95 backdrop-blur lg:left-72">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div className="min-w-0">
                <div className="text-base font-bold sm:text-lg">Desperdicio Zero</div>
                <div className="truncate text-xs text-white/55 sm:text-sm">{contextLabel}</div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/85 transition hover:bg-white/[0.08] lg:hidden"
                  aria-label="Abrir menu do painel"
                  title="Menu"
                >
                  <Menu size={16} />
                </button>

                <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 sm:block">
                  {resolvedStatusValue} {statusLabel}
                </div>

                {showBackup ? (
                  <button
                    onClick={handleExport}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/85 sm:hidden"
                    aria-label="Exportar backup"
                    title="Exportar backup"
                  >
                    <Download size={16} />
                  </button>
                ) : null}
                <button
                  onClick={logout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950 sm:hidden"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>

                {showBackup ? (
                  <button
                    onClick={handleExport}
                    className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:inline-flex"
                  >
                    Exportar backup
                  </button>
                ) : null}
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
                {resolvedStatusValue} {statusLabel}
              </div>
            </div>
          </header>

          {feedback.text ? (
            <div className="mx-auto max-w-7xl px-4 pb-2 pt-[6.6rem] md:px-6 md:pt-[5.7rem]">
              <div className={`rounded-2xl px-4 py-3 text-sm ${feedbackTone(feedback.type)}`}>{feedback.text}</div>
            </div>
          ) : null}

          <main
            className={`mx-auto max-w-7xl px-4 py-6 md:px-6 ${
              feedback.text
                ? showRoleBottomNav
                  ? 'pb-[6.5rem] pt-2 lg:pb-6'
                  : 'pb-6 pt-2'
                : showRoleBottomNav
                  ? 'pb-[6.5rem] pt-[6.6rem] md:pt-[5.7rem] lg:pb-6'
                  : 'pb-6 pt-[6.6rem] md:pt-[5.7rem]'
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/70 transition lg:hidden ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-[86vw] max-w-sm border-l border-white/10 bg-neutral-950 p-5 shadow-2xl shadow-black/60 transition-transform lg:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="text-lg font-bold">Menu do painel</div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-white/85 transition hover:bg-neutral-800"
            aria-label="Fechar menu do painel"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`drawer-shell-${item.to}`}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
                      : 'border-white/10 bg-neutral-900 text-white/80 hover:bg-neutral-800'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-neutral-800"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {showRoleBottomNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-950/95 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 md:max-w-3xl md:px-3">
            {roleBottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(location.pathname);
              return (
                <NavLink
                  key={`role-bottom-${item.id}`}
                  to={item.to}
                  className={`relative flex min-h-[3.9rem] flex-col items-center justify-center rounded-2xl px-1 pb-1 pt-1 text-center transition ${
                    active
                      ? 'bg-emerald-500/18 text-emerald-300'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white/85'
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={17} />
                  <span className="mt-1 text-[10px] font-semibold leading-none sm:text-[11px]">{item.label}</span>
                  {active ? <span className="mt-1 h-1 w-5 rounded-full bg-emerald-400" /> : null}
                </NavLink>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
