import { NavLink, useLocation } from 'react-router-dom';
import { getMobileBottomNavItems } from './publicNavConfig';

export default function PublicBottomNav({ session, cartCount = 0 }) {
  if (session?.role === 'admin') {
    return null;
  }

  const location = useLocation();
  const pathname = location.pathname;
  const baseItems = getMobileBottomNavItems(session);

  function renderItem(item) {
    const Icon = item.icon;
    const active = item.isActive(pathname);
    const showCartBadge = item.id === 'cart' && cartCount > 0;

    return (
      <NavLink
        key={`bottom-nav-${item.id}`}
        to={item.to}
        className={`relative flex min-h-[3.9rem] flex-col items-center justify-center rounded-2xl px-1 pb-1 pt-1 text-center transition ${
          active
            ? 'bg-emerald-500/18 text-emerald-300'
            : 'text-white/60 hover:bg-white/[0.06] hover:text-white/85'
        }`}
        aria-label={item.label}
        title={item.label}
      >
        <div className="relative">
          <Icon size={17} />
          {showCartBadge ? (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-neutral-950">
              {cartCount}
            </span>
          ) : null}
        </div>
        <span className="mt-1 text-[10px] font-semibold leading-none sm:text-[11px]">{item.label}</span>
        {active ? <span className="mt-1 h-1 w-5 rounded-full bg-emerald-400" /> : null}
      </NavLink>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-neutral-950/95 backdrop-blur xl:hidden"
      aria-label="Navegacao principal"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 md:max-w-3xl md:px-3 lg:max-w-4xl lg:gap-1.5">
        {baseItems.map(renderItem)}
      </div>
    </nav>
  );
}
