# Desperdicio Zero

MVP web da plataforma **Desperdicio Zero**, com area publica, autenticacao, area do cliente, area administrativa e modulo de Cozinha Inteligente.

## Stack

- React + Vite
- TailwindCSS
- Lucide Icons
- Framer Motion
- LocalStorage (MVP)

## Estrutura

```text
src/
  components/
    admin/
    common/
    layout/
    routing/
    sections/
  pages/
    public/
    auth/
    client/
    admin/
  services/
  hooks/
  utils/
  data/
```

## Pre-requisitos

- Node.js 20+
- npm 10+

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de producao

```bash
npm run build
npm run preview
```

## Deploy com GitHub Pages

Como o projeto usa `HashRouter` + `base: './'`, nao precisa configurar `homepage`.

```bash
npm install
npm run deploy
```

### Deploy automatico (GitHub Actions)

O workflow em `.github/workflows/deploy-gh-pages.yml` publica `dist` no branch `gh-pages` a cada push no branch `main`.

## Preparacao para backend futuro

- Variavel `VITE_BACKEND_PROVIDER` em `.env`:
  - `local` (default MVP)
  - `firebase`
  - `supabase`
- Arquivo `src/services/backendAdapter.js` cria o ponto de extensao para sincronizacao remota.

## Paginas criadas

- Public: `LandingPage`, `DemoKitchen`, `DemoRecipes`, `DemoShopping`, `DemoTips`
- Auth: `LoginPage`, `RegisterPage`
- Client: `DashboardPage`, `InventoryPage`, `ShoppingPage`, `RecipesPage`, `TipsPage`
- Admin: `AdminDashboard`, `ClientManager`, `ClientView`
