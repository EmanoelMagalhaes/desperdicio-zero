import { LogOut, Menu, ShoppingCart, UserCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getDesktopNavItems, getDrawerNavItems } from './publicNavConfig';

export default function PublicResponsiveHeader({
  siteName,
  siteTagline,
  session,
  cartCount = 0,
  onGoToPanel,
  onLogout,
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const desktopNavItems = getDesktopNavItems();
  const drawerNavItems = getDrawerNavItems(session);

  useEffect(() => {
    setDrawerOpen(false);
    setShowAccountMenu(false);
  }, [pathname]);

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

  async function handleLogout() {
    await onLogout();
    setDrawerOpen(false);
    setShowAccountMenu(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 md:px-6 md:py-4">
          <Link to="/" className="block min-w-0">
            <div className="truncate text-lg font-black tracking-tight sm:text-2xl">{siteName}</div>
            <div className="truncate text-xs text-emerald-300 sm:text-sm">{siteTagline}</div>
          </Link>

          <nav className="hidden items-center gap-2 xl:flex">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(pathname);
              return (
                <NavLink
                  key={`desktop-nav-${item.id}`}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900 text-white/90 transition hover:bg-neutral-800 xl:hidden"
              aria-label="Abrir menu principal"
              title="Menu"
            >
              <Menu size={18} />
            </button>

            {session?.role === 'consumer' ? (
              <div className="hidden items-center gap-2 xl:flex">
                <Link
                  to="/pedido"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/85 transition hover:bg-white/[0.08]"
                  aria-label="Carrinho"
                  title="Carrinho"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-semibold text-neutral-950">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/85 transition hover:bg-white/[0.08]"
                    aria-label="Conta do consumidor"
                    title="Conta"
                  >
                    <UserCircle size={18} />
                  </button>

                  {showAccountMenu ? (
                    <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur">
                      <Link
                        to="/meus-pedidos"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <ShoppingCart size={16} />
                        Meus pedidos
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <LogOut size={16} />
                        Sair da conta
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : session ? (
              <button
                onClick={onGoToPanel}
                className="hidden rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02] xl:inline-flex"
              >
                Acessar painel
              </button>
            ) : (
              <div className="hidden items-center gap-2 xl:flex">
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02]"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-black/75 transition xl:hidden ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] h-screen w-[86vw] max-w-sm border-l border-white/15 bg-neutral-950 p-5 shadow-2xl shadow-black/60 transition-transform xl:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="text-lg font-bold">Menu principal</div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-white/85 transition hover:bg-neutral-800"
            aria-label="Fechar menu principal"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {drawerNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);
            return (
              <NavLink
                key={`drawer-nav-${item.id}`}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
                    : 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
          {session?.role === 'consumer' ? (
            <NavLink
              to="/meus-pedidos"
              onClick={() => setDrawerOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
            >
              <ShoppingCart size={16} />
              Meus pedidos
            </NavLink>
          ) : null}

          {session && session.role !== 'consumer' ? (
            <button
              onClick={() => {
                setDrawerOpen(false);
                onGoToPanel();
              }}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:scale-[1.01]"
            >
              Acessar painel
            </button>
          ) : null}

          {session ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
            >
              <LogOut size={16} />
              Sair
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:scale-[1.01]"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
