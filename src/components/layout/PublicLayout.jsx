import { Home, Package, ShoppingCart, ChefHat, Lightbulb, Tag } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

const publicNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ofertas', label: 'Ofertas', icon: Tag },
  { to: '/demo/kitchen', label: 'Estoque', icon: Package },
  { to: '/demo/shopping', label: 'Compras', icon: ShoppingCart },
  { to: '/demo/recipes', label: 'Receitas', icon: ChefHat },
  { to: '/demo/tips', label: 'Desafios', icon: Lightbulb },
];

export default function PublicLayout() {
  const { session } = useAppStore();
  const navigate = useNavigate();

  function goToPanel() {
    if (session?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    if (session?.role === 'consumer') {
      navigate('/ofertas');
      return;
    }

    navigate('/app/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link to="/" className="block">
            <div className="text-xl font-black tracking-tight sm:text-2xl">Desperdicio Zero</div>
            <div className="text-xs text-emerald-300 sm:text-sm">Cozinha Inteligente</div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'
                    }`
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {session ? (
              <button
                onClick={goToPanel}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02] sm:text-base"
              >
                Acessar painel
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] sm:px-4"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02] sm:px-4"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-[6.5rem] md:px-6 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-950/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={`public-mobile-${item.to}`}
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
