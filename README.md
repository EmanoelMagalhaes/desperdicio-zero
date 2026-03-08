# Desperdicio Zero

MVP web da plataforma **Desperdicio Zero**, com area publica, autenticacao, area do cliente, area administrativa e modulo de Cozinha Inteligente.

## Stack

- React + Vite
- TailwindCSS
- Lucide Icons
- Framer Motion
- Firebase Authentication + Firestore (modo online)
- LocalStorage (modo local de fallback)

## Versao estavel

- Nome: **Versao 01**
- Tag Git: `versao-01`
- Commit base: `68e51ce`

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
npm.cmd install
npm.cmd run dev
```

## Build de producao

```bash
npm.cmd run build
npm.cmd run preview
```

## Deploy com GitHub Pages

O workflow em `.github/workflows/deploy-gh-pages.yml` publica `dist` no branch `gh-pages` a cada push no branch `main`.

## Modo de backend

Variavel `VITE_BACKEND_PROVIDER`:

- `local` (MVP local)
- `firebase` (auth e banco real)
- `supabase` (reservado para futuro)

## Documentacao completa

- Indice: [`docs/README.md`](./docs/README.md)
- Versao de referencia: [`docs/VERSAO_01.md`](./docs/VERSAO_01.md)
- Arquitetura: [`docs/ARQUITETURA_E_FLUXOS.md`](./docs/ARQUITETURA_E_FLUXOS.md)
- Setup Windows: [`docs/AMBIENTE_WINDOWS.md`](./docs/AMBIENTE_WINDOWS.md)
- Firebase: [`docs/FIREBASE_OPERACAO.md`](./docs/FIREBASE_OPERACAO.md)
- Deploy: [`docs/DEPLOY_GITHUB_PAGES.md`](./docs/DEPLOY_GITHUB_PAGES.md)
- Manutencao/Rollback: [`docs/MANUTENCAO_E_ROLLBACK.md`](./docs/MANUTENCAO_E_ROLLBACK.md)
- Funcoes-chave: [`docs/FUNCOES_CHAVE.md`](./docs/FUNCOES_CHAVE.md)
- Mapa de arquivos: [`docs/MAPA_DE_ARQUIVOS.md`](./docs/MAPA_DE_ARQUIVOS.md)
