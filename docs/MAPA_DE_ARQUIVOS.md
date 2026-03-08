# Mapa Completo de Arquivos

Este documento lista os arquivos do repositorio e descreve funcao de cada um.

## 1) Raiz do projeto

| Arquivo | Funcao |
|---|---|
| `.env.example` | Modelo das variaveis de ambiente usadas pelo Vite/Firebase. |
| `.gitignore` | Ignora `node_modules`, `dist` e arquivos `.env*` (exceto `.env.example`). |
| `DESPERDICIO_ZERO_PROJECT_CONTEXT.md` | Contexto macro do produto (visao, roadmap e escopo). |
| `FIREBASE_SETUP.md` | Guia resumido de setup Firebase e deploy com variaveis. |
| `PROJECT_SAVEPOINT_2026-03-07.md` | Savepoint intermediario do projeto. |
| `PROJECT_SAVEPOINT_2026-03-07_FINAL.md` | Savepoint final antigo com estado online de epoca. |
| `README.md` | Readme principal do repositorio com stack e comandos basicos. |
| `firestore.rules` | Regras de seguranca do Cloud Firestore. |
| `index.html` | HTML base carregado pelo Vite; injeta `src/main.jsx`. |
| `package.json` | Scripts, dependencias e engines do projeto. |
| `package-lock.json` | Lockfile exato de dependencias npm. |
| `postcss.config.js` | Plugins PostCSS (Tailwind + Autoprefixer). |
| `tailwind.config.js` | Configuracao do Tailwind e paths de varredura. |
| `vite.config.js` | Config Vite com plugin React e `base: './'`. |

## 2) GitHub Actions

| Arquivo | Funcao |
|---|---|
| `.github/workflows/deploy-gh-pages.yml` | Pipeline CI/CD que builda e publica no branch `gh-pages`. |

## 3) Previews

| Arquivo | Funcao |
|---|---|
| `previews/admin-dashboard-preview.png` | Preview visual do dashboard admin (bitmap). |
| `previews/admin-dashboard-preview.svg` | Preview visual do dashboard admin (vetorial). |
| `previews/client-dashboard-preview.png` | Preview visual do dashboard cliente (bitmap). |
| `previews/client-dashboard-preview.svg` | Preview visual do dashboard cliente (vetorial). |
| `previews/public-home-preview.png` | Preview visual da home publica (bitmap). |
| `previews/public-home-preview.svg` | Preview visual da home publica (vetorial). |

## 4) Entrada e estilo global (`src`)

| Arquivo | Funcao |
|---|---|
| `src/main.jsx` | Ponto de entrada React, monta router e provider global. |
| `src/App.jsx` | Declaracao central de todas as rotas. |
| `src/index.css` | Estilos globais base com Tailwind e reset simples. |

## 5) Dados e estado

| Arquivo | Funcao |
|---|---|
| `src/data/defaultState.js` | Estado inicial do modo local (contas demo, estoque, compras, desafios). |
| `src/hooks/useAppStore.jsx` | Store global: sessao, dados operacionais, integracao local/Firebase, acoes da app. |

## 6) Servicos

| Arquivo | Funcao |
|---|---|
| `src/services/backendAdapter.js` | Define provider ativo (`local`/`firebase`) e ponto de extensao futuro. |
| `src/services/storageService.js` | Persistencia local via LocalStorage. |
| `src/services/authService.js` | Auth em modo local (sem backend real). |
| `src/services/firebaseClient.js` | Inicializacao Firebase app/auth/db e validacao de configuracao. |
| `src/services/firebaseAuthService.js` | Login/cadastro/reset/verificacao/aprovacao no Firebase Auth + perfil em Firestore. |
| `src/services/firebaseDataService.js` | Operacoes de dados no Firestore (inventory/shopping/challenges/users). |
| `src/services/kitchenService.js` | Regras da Cozinha Inteligente (sugestoes e dicas). |

## 7) Utilitarios

| Arquivo | Funcao |
|---|---|
| `src/utils/date.js` | Funcoes de data para validade e status de risco. |
| `src/utils/export.js` | Exportacao de backup JSON no navegador. |
| `src/utils/ids.js` | Gerador de IDs unicos simples com prefixo + timestamp. |

## 8) Components - comuns

| Arquivo | Funcao |
|---|---|
| `src/components/common/LoadingScreen.jsx` | Tela de carregamento inicial enquanto store prepara estado. |
| `src/components/common/MetricCard.jsx` | Card de metrica reutilizavel com icone e tema. |
| `src/components/common/SectionTitle.jsx` | Bloco padrao de titulo/subtitulo de secao. |

## 9) Components - layout

| Arquivo | Funcao |
|---|---|
| `src/components/layout/PublicLayout.jsx` | Layout publico com header e menu mobile. |
| `src/components/layout/AppShell.jsx` | Shell principal de cliente/admin com sidebar, header, feedback e menu mobile. |
| `src/components/layout/ClientLayout.jsx` | Configura menu do cliente e reaproveita `AppShell`. |
| `src/components/layout/AdminLayout.jsx` | Configura menu do admin e reaproveita `AppShell`. |

## 10) Components - roteamento

| Arquivo | Funcao |
|---|---|
| `src/components/routing/GuestRoute.jsx` | Bloqueia rotas de auth para usuario autenticado. |
| `src/components/routing/ProtectedRoute.jsx` | Protege rotas por autenticacao e role. |

## 11) Components - admin

| Arquivo | Funcao |
|---|---|
| `src/components/admin/AdminClientToolbar.jsx` | Seletor de cliente ativo para operacao admin em tempo real. |

## 12) Components - secoes de negocio

| Arquivo | Funcao |
|---|---|
| `src/components/sections/AdminSummarySection.jsx` | Indicadores agregados de clientes para admin. |
| `src/components/sections/DashboardSection.jsx` | Visao geral com itens criticos e atalhos operacionais. |
| `src/components/sections/InventorySection.jsx` | Formulario e lista de estoque com CRUD e feedback. |
| `src/components/sections/ShoppingSection.jsx` | Formulario e lista de compras com prioridade e check. |
| `src/components/sections/RecipesSection.jsx` | Cartoes de sugestoes de receitas/acoes. |
| `src/components/sections/TipsSection.jsx` | Dicas praticas e desafios com controle de conclusao. |

## 13) Pages - publicas

| Arquivo | Funcao |
|---|---|
| `src/pages/public/LandingPage.jsx` | Home publica com proposta de valor e atalhos de demo. |
| `src/pages/public/DemoKitchen.jsx` | Encapsula `InventorySection` em modo somente leitura. |
| `src/pages/public/DemoShopping.jsx` | Encapsula `ShoppingSection` em modo somente leitura. |
| `src/pages/public/DemoRecipes.jsx` | Encapsula `RecipesSection` para dados demo. |
| `src/pages/public/DemoTips.jsx` | Encapsula `TipsSection` em modo somente leitura. |
| `src/pages/public/PendingApprovalPage.jsx` | Tela apos cadastro pendente com orientacao e marketing. |

## 14) Pages - auth

| Arquivo | Funcao |
|---|---|
| `src/pages/auth/LoginPage.jsx` | Login cliente/admin com feedback e redirecionamento. |
| `src/pages/auth/RegisterPage.jsx` | Cadastro de cliente com redirecionamento para pendencia. |
| `src/pages/auth/ForgotPasswordPage.jsx` | Envio de reset de senha. |

## 15) Pages - cliente

| Arquivo | Funcao |
|---|---|
| `src/pages/client/DashboardPage.jsx` | Wrapper do dashboard cliente. |
| `src/pages/client/InventoryPage.jsx` | Wrapper da secao de estoque cliente. |
| `src/pages/client/ShoppingPage.jsx` | Wrapper da secao de compras cliente. |
| `src/pages/client/RecipesPage.jsx` | Wrapper da secao de receitas cliente. |
| `src/pages/client/TipsPage.jsx` | Wrapper da secao de dicas/desafios cliente. |

## 16) Pages - admin

| Arquivo | Funcao |
|---|---|
| `src/pages/admin/AdminDashboard.jsx` | Wrapper do resumo administrativo. |
| `src/pages/admin/ClientManager.jsx` | Aprovacao/reprovacao de clientes e cadastro por admin. |
| `src/pages/admin/ClientView.jsx` | Simulacao da visao operacional do cliente pelo admin. |

## 17) Arquivos locais que normalmente NAO vao para Git

| Caminho | Funcao |
|---|---|
| `.env.local` | Variaveis locais (segredos). |
| `node_modules/` | Dependencias instaladas localmente. |
| `dist/` | Build de producao gerada localmente. |
| `.git/` | Metadados internos do repositorio Git. |

## 18) Sobre Node, Firebase, GitHub e o papel de cada um

- **Node.js**: runtime para executar ferramentas JS (Vite, npm scripts).
- **npm**: gerenciador de pacotes e scripts (`install`, `run dev`, `run build`).
- **Git**: controle de versao local (commits, branches, tags, rollback).
- **GitHub**: repositorio remoto e colaboracao.
- **GitHub Actions**: automacao de build/deploy.
- **GitHub Pages**: hospedagem estatica do front-end.
- **Firebase Authentication**: login, cadastro, verificacao de e-mail, reset de senha.
- **Cloud Firestore**: banco online com dados operacionais e regras de acesso.

## 19) Arquivos de documentacao adicionados na Versao 01

| Arquivo | Funcao |
|---|---|
| `PROJECT_SAVEPOINT_VERSAO_01.md` | Savepoint oficial da Versao 01 com comandos de recuperacao. |
| `docs/README.md` | Indice principal da documentacao tecnica. |
| `docs/VERSAO_01.md` | Documento oficial da baseline estavel. |
| `docs/ARQUITETURA_E_FLUXOS.md` | Arquitetura tecnica, rotas e fluxos de negocio. |
| `docs/AMBIENTE_WINDOWS.md` | Instalacao e operacao local no Windows. |
| `docs/FIREBASE_OPERACAO.md` | Configuracao e operacao do Firebase. |
| `docs/DEPLOY_GITHUB_PAGES.md` | Processo completo de deploy no GitHub Pages. |
| `docs/MANUTENCAO_E_ROLLBACK.md` | Estrategias de manutencao, rollback e recuperacao. |
| `docs/FUNCOES_CHAVE.md` | Mapa de funcoes, responsabilidades e pontos de edicao. |
| `docs/MAPA_DE_ARQUIVOS.md` | Inventario detalhado dos arquivos do repositorio. |
