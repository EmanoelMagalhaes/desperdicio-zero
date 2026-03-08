import { Home, Package, ShoppingCart, ChefHat, Lightbulb } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

const publicNavItems = [
  { to: '/', label: 'Home', icon: Home },
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

    navigate('/app/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="block">
            <div className="text-2xl font-black tracking-tight">Desperdicio Zero</div>
            <div className="text-sm text-emerald-300">Cozinha Inteligente</div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={goToPanel}
                className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:scale-[1.02]"
              >
                Acessar painel
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 font-semibold text-white/85 transition hover:bg-white/[0.08]"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:scale-[1.02]"
                >
                  Cadastrar-se
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
