import {
  ChefHat,
  ClipboardList,
  Home,
  Lightbulb,
  Package,
  ShoppingCart,
  Tag,
  UserCircle,
} from 'lucide-react';

function startsWithPath(pathname, target) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function getAccountDestination(session) {
  if (!session) return '/login';
  if (session.role === 'admin') return '/admin/meus-dados';
  if (session.role === 'consumer') return '/meus-dados';
  return '/app/meus-dados';
}

export function isAccountRoute(pathname) {
  return (
    startsWithPath(pathname, '/login') ||
    startsWithPath(pathname, '/register') ||
    startsWithPath(pathname, '/forgot-password') ||
    startsWithPath(pathname, '/meus-dados') ||
    startsWithPath(pathname, '/app/meus-dados') ||
    startsWithPath(pathname, '/admin/meus-dados')
  );
}

export function getDesktopNavItems() {
  return [
    {
      id: 'home',
      to: '/',
      label: 'Home',
      icon: Home,
      isActive: (pathname) => pathname === '/',
    },
    {
      id: 'offers',
      to: '/ofertas',
      label: 'Ofertas',
      icon: Tag,
      isActive: (pathname) => startsWithPath(pathname, '/ofertas'),
    },
    {
      id: 'plans',
      to: '/planos',
      label: 'Planos',
      icon: ClipboardList,
      isActive: (pathname) => startsWithPath(pathname, '/planos') || startsWithPath(pathname, '/assinatura'),
    },
    {
      id: 'inventory',
      to: '/demo/kitchen',
      label: 'Estoque',
      icon: Package,
      isActive: (pathname) => startsWithPath(pathname, '/demo/kitchen') || startsWithPath(pathname, '/demo/cozinha'),
    },
    {
      id: 'shopping',
      to: '/demo/shopping',
      label: 'Compras',
      icon: ShoppingCart,
      isActive: (pathname) =>
        startsWithPath(pathname, '/demo/shopping') || startsWithPath(pathname, '/demo/compras'),
    },
    {
      id: 'recipes',
      to: '/demo/recipes',
      label: 'Receitas',
      icon: ChefHat,
      isActive: (pathname) => startsWithPath(pathname, '/demo/recipes') || startsWithPath(pathname, '/demo/receitas'),
    },
    {
      id: 'tips',
      to: '/demo/tips',
      label: 'Desafios',
      icon: Lightbulb,
      isActive: (pathname) => startsWithPath(pathname, '/demo/tips') || startsWithPath(pathname, '/demo/dicas'),
    },
  ];
}

export function getMobileBottomNavItems(session) {
  return [
    {
      id: 'home',
      to: '/',
      label: 'Inicio',
      icon: Home,
      isActive: (pathname) => pathname === '/',
    },
    {
      id: 'plans',
      to: '/planos',
      label: 'Planos',
      icon: ClipboardList,
      isActive: (pathname) => startsWithPath(pathname, '/planos') || startsWithPath(pathname, '/assinatura'),
    },
    {
      id: 'offers',
      to: '/ofertas',
      label: 'Ofertas',
      icon: Tag,
      isActive: (pathname) => startsWithPath(pathname, '/ofertas'),
    },
    {
      id: 'cart',
      to: '/pedido',
      label: 'Carrinho',
      icon: ShoppingCart,
      isActive: (pathname) => startsWithPath(pathname, '/pedido'),
    },
    {
      id: 'account',
      to: getAccountDestination(session),
      label: 'Sua Conta',
      icon: UserCircle,
      isActive: (pathname) => isAccountRoute(pathname),
    },
  ];
}

export function getDrawerNavItems(session) {
  const baseItems = getMobileBottomNavItems(session);

  if (session) {
    return [
      ...baseItems,
      {
        id: 'panel',
        to: session.role === 'admin' ? '/admin/dashboard' : session.role === 'consumer' ? '/ofertas' : '/app/dashboard',
        label: 'Painel',
        icon: Home,
        isActive: (pathname) =>
          startsWithPath(pathname, '/admin') ||
          startsWithPath(pathname, '/app') ||
          startsWithPath(pathname, '/restaurante') ||
          startsWithPath(pathname, '/meus-pedidos'),
      },
    ];
  }

  return [
    ...baseItems,
    {
      id: 'inventory',
      to: '/demo/kitchen',
      label: 'Estoque',
      icon: Package,
      isActive: (pathname) => startsWithPath(pathname, '/demo/kitchen') || startsWithPath(pathname, '/demo/cozinha'),
    },
    {
      id: 'shopping',
      to: '/demo/shopping',
      label: 'Compras',
      icon: ShoppingCart,
      isActive: (pathname) =>
        startsWithPath(pathname, '/demo/shopping') || startsWithPath(pathname, '/demo/compras'),
    },
    {
      id: 'tips',
      to: '/demo/tips',
      label: 'Desafios',
      icon: Lightbulb,
      isActive: (pathname) => startsWithPath(pathname, '/demo/tips') || startsWithPath(pathname, '/demo/dicas'),
    },
  ];
}
