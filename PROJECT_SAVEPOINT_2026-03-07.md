# Desperdicio Zero - Savepoint (2026-03-07)

Este arquivo salva o estado da conversa e o plano completo para retomar o projeto depois.

## 1) Estado atual do projeto

- O app foi reorganizado em arquitetura profissional React + Vite.
- Estrutura criada:
  - `src/components`
  - `src/pages`
  - `src/services`
  - `src/hooks`
  - `src/utils`
  - `src/data`
- Rotas separadas por area:
  - Public
  - Auth
  - Client
  - Admin
- Deploy preparado para GitHub Pages com workflow em:
  - `.github/workflows/deploy-gh-pages.yml`
- Projeto ainda esta em MVP com `LocalStorage` (sem backend real).

## 2) Limite atual (importante)

Atualmente os dados ficam no navegador local:
- Sem multiusuario real entre dispositivos.
- Sem sincronizacao cloud.
- Sem autenticacao de producao.
- Pode perder dados ao limpar navegador.

Para produto real, precisa migrar para Firebase/Supabase.

## 3) O que ja existe na pasta

### Raiz
- `.env.example`: modelo de variaveis de ambiente.
- `.gitignore`: ignora arquivos nao versionaveis.
- `DESPERDICIO_ZERO_PROJECT_CONTEXT.md`: contexto resumido.
- `index.html`: HTML base do app.
- `package.json`: scripts e dependencias.
- `postcss.config.js`: PostCSS/Tailwind.
- `README.md`: guia atual de execucao/deploy.
- `tailwind.config.js`: config Tailwind.
- `vite.config.js`: config Vite (`base: './'`).
- `PROJECT_SAVEPOINT_2026-03-07.md`: este checkpoint.

### Deploy
- `.github/workflows/deploy-gh-pages.yml`: build + publicacao automatica no `gh-pages`.

### Previews
- `previews/*.png` e `previews/*.svg`: apenas mockups de visual no chat.

### App (`src`)
- `src/main.jsx`: entrada React (Router + AppStoreProvider).
- `src/App.jsx`: roteamento geral.
- `src/index.css`: estilos globais.

#### Components
- `src/components/admin/AdminClientToolbar.jsx`
- `src/components/common/{LoadingScreen,MetricCard,SectionTitle}.jsx`
- `src/components/layout/{AppShell,ClientLayout,AdminLayout,PublicLayout}.jsx`
- `src/components/routing/{GuestRoute,ProtectedRoute}.jsx`
- `src/components/sections/{DashboardSection,InventorySection,ShoppingSection,RecipesSection,TipsSection,AdminSummarySection}.jsx`

#### Pages
- Public: `LandingPage`, `DemoKitchen`, `DemoRecipes`, `DemoShopping`, `DemoTips`
- Auth: `LoginPage`, `RegisterPage`
- Client: `DashboardPage`, `InventoryPage`, `ShoppingPage`, `RecipesPage`, `TipsPage`
- Admin: `AdminDashboard`, `ClientManager`, `ClientView`

#### Dados, hooks, services, utils
- `src/data/defaultState.js`: seed demo local.
- `src/hooks/useAppStore.js`: estado global + acoes.
- `src/services/authService.js`: login/cadastro local.
- `src/services/storageService.js`: persistencia local.
- `src/services/kitchenService.js`: regras de sugestao.
- `src/services/backendAdapter.js`: ponto de extensao para Firebase/Supabase.
- `src/utils/date.js`, `src/utils/ids.js`

## 4) Passo a passo para colocar no ar (do zero)

## 4.1 Pre-requisitos no PC
1. Instalar Node.js LTS 20+
2. Instalar Git
3. Criar conta GitHub

## 4.2 Verificar instalacao
```powershell
node -v
npm -v
git --version
```

## 4.3 Rodar localmente
```powershell
cd "C:\Users\emano\OneDrive\Documentos\Projetos Codex"
npm install
npm run dev
```

Abrir: `http://localhost:5173`

## 4.4 Subir no GitHub
```powershell
cd "C:\Users\emano\OneDrive\Documentos\Projetos Codex"
git init
git add .
git commit -m "Estrutura profissional do Desperdicio Zero"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/desperdicio-zero.git
git push -u origin main
```

## 4.5 Publicar GitHub Pages
1. GitHub > Settings > Pages
2. Source: branch `gh-pages`, pasta `/ (root)`
3. Cada push no `main` roda o workflow e atualiza o site

URL esperada:
`https://SEU_USUARIO.github.io/desperdicio-zero/`

## 5) Migracao para Firebase (plano salvo)

Objetivo: sair de LocalStorage para backend real (auth + banco + tempo real).

1. Criar projeto no Firebase Console
2. Registrar app web
3. Ativar Authentication (Email/Password)
4. Criar Firestore
5. Instalar SDK:
```powershell
npm install firebase
```
6. Criar `.env.local` com:
```env
VITE_BACKEND_PROVIDER=firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
7. Criar `src/services/firebaseClient.js` (initializeApp/getAuth/getFirestore)
8. Migrar `authService.js` para Firebase Auth
9. Criar colecao `users/{uid}` com `role/name/email/businessType`
10. Migrar dados para Firestore:
   - `clients/{clientId}/inventory/{itemId}`
   - `clients/{clientId}/shopping/{itemId}`
   - `clients/{clientId}/meta/challenges`
11. Adaptar `useAppStore.js` para leitura/escrita remota
12. Aplicar regras de seguranca no Firestore (cliente so ve os proprios dados; admin ve todos)
13. Testar local e publicar

## 6) Ordem recomendada para retomar depois

1. Garantir ambiente (`node`, `npm`, `git`)
2. Rodar local (`npm install`, `npm run dev`)
3. Publicar MVP no GitHub Pages
4. So depois iniciar migracao Firebase:
   - Fase A: Auth
   - Fase B: Inventory/Shopping/Challenges
   - Fase C: regras de acesso + admin

## 7) Observacoes

- Este savepoint foi criado para voce voltar e continuar exatamente daqui.
- O projeto atual funciona como MVP demo/local; producao real depende da migracao backend.
