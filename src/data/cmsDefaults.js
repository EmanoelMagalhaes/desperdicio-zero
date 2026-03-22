export const CMS_SECTIONS = ['hero', 'banner', 'highlights', 'offers', 'contact'];

export const cmsDefaults = {
  site: {
    name: 'Desperdicio Zero',
    tagline: 'Cozinha Inteligente',
  },
  home: {
    hero: {
      badge: 'Conheca a plataforma antes de criar sua conta',
      titlePrefix: 'Plataforma para reduzir desperdicio e operar uma',
      titleHighlight: 'Cozinha Inteligente',
      description: 'Explore o site, veja estoque, compras, receitas e desafios com exemplos praticos do fluxo real.',
      ctaPrimary: 'Criar conta',
      ctaSecondary: 'Ver despensa',
    },
    sectionsOrder: [...CMS_SECTIONS],
    sectionsEnabled: {
      hero: true,
      banner: true,
      highlights: true,
      offers: true,
      contact: true,
    },
  },
  banners: [
    {
      id: 'banner-1',
      title: 'Reduza desperdicio com mais previsao',
      text: 'Acompanhe indicadores operacionais e transforme itens criticos em ofertas inteligentes.',
      imageUrl: '',
      link: '/ofertas',
      enabled: true,
    },
  ],
  highlights: [
    {
      id: 'h1',
      title: 'Estoque inteligente',
      text: 'Controle validade, categorias e prioridades com alertas claros.',
      link: '/demo/kitchen',
    },
    {
      id: 'h2',
      title: 'Receitas sugeridas',
      text: 'Sugestoes baseadas no estoque atual para acelerar o giro.',
      link: '/demo/recipes',
    },
    {
      id: 'h3',
      title: 'Compras planejadas',
      text: 'Listas mais assertivas para evitar perdas e compras duplicadas.',
      link: '/demo/shopping',
    },
  ],
  featuredOffers: [],
  contact: {
    email: 'contato@desperdiciozero.com',
    phone: '(00) 0000-0000',
    whatsapp: '(00) 00000-0000',
    address: 'Endereco nao informado',
  },
};
