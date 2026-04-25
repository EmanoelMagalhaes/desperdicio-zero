import { ClipboardList, Globe, Home, ShoppingCart, Tag, UserCircle } from 'lucide-react';

function startsWithPath(pathname, target) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function isPublicRoute(pathname) {
  return (
    pathname === '/' ||
    startsWithPath(pathname, '/planos') ||
    startsWithPath(pathname, '/assinatura') ||
    startsWithPath(pathname, '/ofertas') ||
    startsWithPath(pathname, '/pedido') ||
    startsWithPath(pathname, '/demo')
  );
}

export function getRoleBottomNavItems(role) {
  if (role === 'consumer') {
    return [
      {
        id: 'consumer-home',
        to: '/ofertas',
        label: 'Inicio',
        icon: Home,
        isActive: (pathname) => startsWithPath(pathname, '/ofertas'),
      },
      {
        id: 'consumer-orders',
        to: '/meus-pedidos',
        label: 'Pedidos',
        icon: ClipboardList,
        isActive: (pathname) => startsWithPath(pathname, '/meus-pedidos'),
      },
      {
        id: 'consumer-cart',
        to: '/pedido',
        label: 'Carrinho',
        icon: ShoppingCart,
        isActive: (pathname) => startsWithPath(pathname, '/pedido'),
      },
      {
        id: 'consumer-plans',
        to: '/planos',
        label: 'Planos',
        icon: Tag,
        isActive: (pathname) => startsWithPath(pathname, '/planos') || startsWithPath(pathname, '/assinatura'),
      },
      {
        id: 'consumer-account',
        to: '/meus-dados',
        label: 'Conta',
        icon: UserCircle,
        isActive: (pathname) => startsWithPath(pathname, '/meus-dados'),
      },
    ];
  }

  if (role === 'client' || role === 'restaurant') {
    return [
      {
        id: 'client-dashboard',
        to: '/app/dashboard',
        label: 'Painel',
        icon: Home,
        isActive: (pathname) => startsWithPath(pathname, '/app/dashboard'),
      },
      {
        id: 'client-offers',
        to: '/restaurante/ofertas',
        label: 'Ofertas',
        icon: Tag,
        isActive: (pathname) => startsWithPath(pathname, '/restaurante/ofertas'),
      },
      {
        id: 'client-orders',
        to: '/restaurante/pedidos',
        label: 'Pedidos',
        icon: ClipboardList,
        isActive: (pathname) => startsWithPath(pathname, '/restaurante/pedidos'),
      },
      {
        id: 'client-account',
        to: '/app/meus-dados',
        label: 'Conta',
        icon: UserCircle,
        isActive: (pathname) => startsWithPath(pathname, '/app/meus-dados'),
      },
      {
        id: 'client-public-site',
        to: '/',
        label: 'Site',
        icon: Globe,
        isActive: (pathname) => isPublicRoute(pathname),
      },
    ];
  }

  return [];
}
