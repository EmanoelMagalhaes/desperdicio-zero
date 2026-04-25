import { Outlet, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import PublicBottomNav from '../navigation/PublicBottomNav';
import PublicResponsiveHeader from '../navigation/PublicResponsiveHeader';

export default function PublicLayout() {
  const { session, logout, cart, cmsPublic } = useAppStore();
  const navigate = useNavigate();
  const cartCount = useMemo(() => cart?.items?.length || 0, [cart]);

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

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <PublicResponsiveHeader
        siteName={cmsPublic.site.name}
        siteTagline={cmsPublic.site.tagline}
        session={session}
        cartCount={cartCount}
        onGoToPanel={goToPanel}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[5.8rem] md:px-6 md:pb-[calc(5.8rem+env(safe-area-inset-bottom))] md:pt-[6.2rem] lg:pb-8 lg:pt-[6.2rem]">
        <Outlet />
      </main>

      <PublicBottomNav session={session} cartCount={cartCount} />
    </div>
  );
}
