# Funcoes Chave e Onde Mexer

Este guia mapeia os pontos de codigo mais importantes para manutencao.

## 1) Entrada da aplicacao

## `src/main.jsx`

Responsavel por montar:

- `HashRouter` (roteamento para GitHub Pages)
- `AppStoreProvider` (estado global)
- `App` (rotas)

Quando editar:
- se mudar tipo de router;
- se adicionar provider global (tema, i18n, query client etc.).

## `src/App.jsx`

Define todas as rotas.

Onde editar:
- nova pagina publica: adicionar em bloco `PublicLayout`;
- nova pagina de cliente: adicionar em bloco `ProtectedRoute allowRoles=['client']`;
- nova pagina admin: adicionar em bloco `ProtectedRoute allowRoles=['admin']`.

## 2) Estado global e orquestracao

## `src/hooks/useAppStore.jsx`

Arquivo mais importante do projeto.

### Estado principal

- `state`: dados completos da aplicacao
- `session`: usuario logado
- `ready`: controle de carregamento
- `adminSelectedClientId`: cliente ativo para admin

### Funcoes de auth

- `login(mode, email, password)`
- `register(form)`
- `requestPasswordReset(email)`
- `logout()`

### Funcoes admin

- `createClientByAdmin(form)`
- `setClientApproval(clientId, approvalStatus)`
- `setAdminSelectedClientId(id)`

### Funcoes operacionais

- `addInventory(item)`
- `deleteInventory(id)`
- `addShopping(item)`
- `toggleShopping(id)`
- `deleteShopping(id)`
- `toggleChallenge(challenge)`

### Utilitarios de negocio

- `pendingCount` (itens criticos)
- `exportBackup()`

Quando editar:
- qualquer regra global de sessao;
- sincronizacao local/Firebase;
- comportamento padrao de dados do app.

## 3) Servicos de backend e dados

## `src/services/backendAdapter.js`

- define provider ativo (`local`, `firebase`)
- funcoes:
  - `isRemoteEnabled()`
  - `isFirebase()`
  - `sync()` (stub para extensao futura)

## `src/services/authService.js` (modo local)

Funcoes:
- `loginWithMode(state, mode, email, password)`
- `registerClientAccount(state, form)`
- `createClientAccountByAdmin(state, form)`

Usado quando `VITE_BACKEND_PROVIDER=local`.

## `src/services/firebaseClient.js`

Responsavel por:
- inicializar Firebase app;
- expor `auth` e `db`;
- validar se as chaves existem (`assertFirebaseReady`);
- criar app secundario para fluxo sem derrubar sessao atual (`createSecondaryAuthApp`).

## `src/services/firebaseAuthService.js`

Responsavel por auth real.

Funcoes principais:
- `loginWithFirebase(mode, email, password)`
- `registerClientWithFirebase(form)`
- `sendPasswordResetWithFirebase(email)`
- `createClientByAdminWithFirebase(form, adminAccount)`
- `subscribeAuthSession(onChange)`
- `logoutFirebase()`

Pontos criticos:
- verifica `emailVerified` para cliente;
- exige `approvalStatus=approved` para cliente entrar;
- trata erro de email ja em uso com fluxo de recuperacao.

## `src/services/firebaseDataService.js`

Responsavel pelos dados operacionais no Firestore.

Funcoes principais:
- `loadClientData(clientId)`
- `subscribeClientAccounts(onChange)`
- `subscribeClientData(clientId, onChange)`
- `updateClientApprovalStatus(clientId, status, adminId)`
- `add/delete inventory`
- `add/toggle/delete shopping`
- `toggleChallengeItem(clientId, challenge)`

## `src/services/storageService.js`

Camada de LocalStorage:
- `loadState(storageKey, defaultState)`
- `persistState(storageKey, state)`

## `src/services/kitchenService.js`

Motor da Cozinha Inteligente (versao atual baseada em regras).

Funcoes:
- `recipeSuggestions(items)`
- `challengeTips()`

## 4) Utilitarios

## `src/utils/date.js`

- `addDays(days)`
- `daysUntil(dateStr)`
- `statusFromExpiry(dateStr)`

Essencial para alertas de validade.

## `src/utils/ids.js`

- `createId(prefix)`

## `src/utils/export.js`

- `downloadJson(filename, data)`

Usado no botao de backup.

## 5) Componentes de layout

## `src/components/layout/PublicLayout.jsx`

- header publico;
- navegacao desktop e mobile;
- links para login/cadastro.

## `src/components/layout/AppShell.jsx`

Shell comum para cliente/admin:
- sidebar (desktop)
- header
- navegacao mobile inferior
- botoes sair e exportar backup

## `src/components/layout/ClientLayout.jsx`

Injeta menu do cliente no `AppShell`.

## `src/components/layout/AdminLayout.jsx`

Injeta menu do admin no `AppShell`.

## 6) Guardas

## `src/components/routing/GuestRoute.jsx`

Bloqueia login/register para usuario ja autenticado.

## `src/components/routing/ProtectedRoute.jsx`

Bloqueia rotas protegidas para nao autenticado ou role incorreto.

## 7) Componentes de secao

- `DashboardSection.jsx` -> visao geral e itens criticos
- `InventorySection.jsx` -> CRUD de estoque
- `ShoppingSection.jsx` -> CRUD de lista de compras
- `RecipesSection.jsx` -> sugestoes
- `TipsSection.jsx` -> dicas e desafios
- `AdminSummarySection.jsx` -> indicadores agregados do admin

Esses componentes concentram a maior parte da UI de negocio.

## 8) Paginas por dominio

### Public
- `LandingPage`
- `DemoKitchen`
- `DemoShopping`
- `DemoRecipes`
- `DemoTips`
- `PendingApprovalPage`

### Auth
- `LoginPage`
- `RegisterPage`
- `ForgotPasswordPage`

### Client
- `DashboardPage`
- `InventoryPage`
- `ShoppingPage`
- `RecipesPage`
- `TipsPage`

### Admin
- `AdminDashboard`
- `ClientManager`
- `ClientView`

## 9) Onde mexer para tarefas comuns

### Alterar texto de mensagem de login/cadastro

- `src/pages/auth/LoginPage.jsx`
- `src/pages/auth/RegisterPage.jsx`
- `src/services/firebaseAuthService.js`

### Mudar regra de aprovacao

- `src/services/firebaseAuthService.js`
- `src/services/firebaseDataService.js`
- `src/pages/admin/ClientManager.jsx`
- `firestore.rules`

### Mudar sugestoes da Cozinha Inteligente

- `src/services/kitchenService.js`

### Mudar menu mobile

- `src/components/layout/AppShell.jsx`
- `src/components/layout/PublicLayout.jsx`

### Mudar deploy

- `.github/workflows/deploy-gh-pages.yml`
- `vite.config.js`
- `package.json`

## 10) Risco tecnico por arquivo

Alto risco (testar bem apos mexer):
- `src/hooks/useAppStore.jsx`
- `src/services/firebaseAuthService.js`
- `src/services/firebaseDataService.js`
- `firestore.rules`

Medio risco:
- `src/App.jsx`
- `src/components/layout/AppShell.jsx`
- `src/pages/admin/ClientManager.jsx`

Baixo risco:
- arquivos de preview
- docs
- textos estaticos de paginas
