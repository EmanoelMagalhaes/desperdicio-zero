# Arquitetura e Fluxos

Este documento explica como a aplicacao funciona por dentro.

## 1) Visao arquitetural

A aplicacao segue arquitetura de frontend com separacao por responsabilidade:

- `pages`: telas de rota;
- `components`: blocos reutilizaveis de UI;
- `hooks`: estado global e regras de orquestracao;
- `services`: regra de negocio, auth, persistencia, Firebase;
- `utils`: funcoes utilitarias puras;
- `data`: estado inicial do MVP local.

## 2) Fluxo de inicializacao (boot)

Quando o app abre:

1. `src/main.jsx` monta `HashRouter` + `AppStoreProvider` + `App`.
2. `src/hooks/useAppStore.jsx` decide o modo:
   - `local`: carrega `localStorage`;
   - `firebase`: usa sessao do Firebase Auth + Firestore em tempo real.
3. `src/App.jsx` renderiza rotas com guards:
   - publica (sem login),
   - guest (login/register),
   - cliente protegido,
   - admin protegido.

## 3) Rotas da aplicacao

### Publicas

- `/` -> Landing page
- `/demo/kitchen` -> despensa demo
- `/demo/shopping` -> compras demo
- `/demo/recipes` -> receitas demo
- `/demo/tips` -> dicas/desafios demo
- aliases antigos com redirect:
  - `/demo/cozinha` -> `/demo/kitchen`
  - `/demo/compras` -> `/demo/shopping`
  - `/demo/receitas` -> `/demo/recipes`
  - `/demo/dicas` -> `/demo/tips`
- cadastro pendente:
  - `/register/pending`
  - `/cadastro-pendente`

### Auth (somente para nao logado)

- `/login`
- `/register`
- `/forgot-password`

### Cliente (role client)

- `/app/dashboard`
- `/app/inventory`
- `/app/shopping`
- `/app/recipes`
- `/app/tips`

### Admin (role admin)

- `/admin/dashboard`
- `/admin/clientes`
- `/admin/cliente`

## 4) Guardas de acesso

### `GuestRoute`

- Se sessao existe e role for `admin`: redireciona para `/admin/dashboard`.
- Se sessao existe e role for `client`: redireciona para `/app/dashboard`.
- Se nao houver sessao: permite abrir login/register.

### `ProtectedRoute`

- Sem sessao -> redireciona para `/login`.
- Sessao com role fora da lista permitida -> redireciona para dashboard correto.
- Sessao valida -> renderiza `Outlet`.

## 5) Estado global (`useAppStore`)

`useAppStore` e o centro da aplicacao.

Responsabilidades principais:

- sessao atual (`session`);
- cliente ativo (`activeClientId` / `activeClient`);
- dados operacionais:
  - `inventories`,
  - `shoppingLists`,
  - `challenges`;
- metrica de itens criticos (`pendingCount`);
- modos de backend (`local` ou `firebase`);
- funcoes publicas para paginas e componentes.

Funcoes expostas:

- auth:
  - `login`
  - `register`
  - `requestPasswordReset`
  - `logout`
- administracao:
  - `createClientByAdmin`
  - `setClientApproval`
  - `setAdminSelectedClientId`
- operacao cliente:
  - `addInventory`
  - `deleteInventory`
  - `addShopping`
  - `toggleShopping`
  - `deleteShopping`
  - `toggleChallenge`
- utilitario:
  - `exportBackup`

## 6) Modo local vs modo Firebase

Definido por `VITE_BACKEND_PROVIDER`:

- `local`: usa `LocalStorage` e dados de `defaultState`.
- `firebase`: usa Firebase Auth + Firestore.

Arquivo-chave: `src/services/backendAdapter.js`.

## 7) Modelo de dados

### Local (MVP)

Objeto unico com:

- `clientAccounts`
- `adminAccounts`
- `inventories` por cliente
- `shoppingLists` por cliente
- `challenges` por cliente

### Firebase

Colecoes:

- `users/{uid}`
  - `role`
  - `approvalStatus`
  - `name`
  - `email`
  - `businessType`
- `clients/{uid}/inventory/{itemId}`
- `clients/{uid}/shopping/{itemId}`
- `clients/{uid}/meta/challenges`

## 8) Fluxo de cadastro e aprovacao

1. Cliente preenche `/register`.
2. `registerClientWithFirebase` cria usuario no Auth.
3. Sistema envia verificacao de e-mail.
4. Perfil e salvo em `users/{uid}` com:
   - `role=client`
   - `approvalStatus=pending`
5. Usuario vai para pagina de cadastro pendente.
6. Admin aprova em `/admin/clientes`.
7. Cliente so entra se:
   - `emailVerified=true`
   - `approvalStatus=approved`

## 9) Fluxo admin

Admin pode:

- aprovar/reprovar cadastros pendentes;
- cadastrar novos clientes ja aprovados;
- escolher cliente ativo no toolbar;
- operar despensa/compras/desafios no contexto do cliente selecionado.

## 10) Cozinha Inteligente (motor atual)

Arquivo: `src/services/kitchenService.js`

Entradas:
- lista de itens de estoque.

Saidas:
- sugestoes de receitas e acoes;
- dicas operacionais;
- priorizacao por validade (com `daysUntil` em `src/utils/date.js`).

## 11) UI e responsividade

- Design system leve com Tailwind utilitario.
- Layout principal:
  - desktop: sidebar lateral + header;
  - mobile: navegacao inferior por icones.
- Componentes de secao desacoplados por dominio:
  - dashboard,
  - inventory,
  - shopping,
  - recipes,
  - tips.

## 12) Pontos de extensao planejados

- trocar provider em `backendAdapter` para `supabase` no futuro;
- adicionar modulo de analytics;
- criar camada de testes (unitarios e e2e);
- implementar funcoes server-side para logica critica (ex: aprovacao mais robusta).
