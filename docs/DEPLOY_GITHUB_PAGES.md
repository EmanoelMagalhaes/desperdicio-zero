# Deploy com GitHub Pages - Passo a Passo

Este projeto esta configurado para deploy automatico via GitHub Actions.

## 1) O que ja esta pronto no codigo

### Build Vite para Pages

Arquivo: `vite.config.js`

- `base: './'`
- combinado com `HashRouter` em `src/main.jsx`
- evita problemas de refresh/404 em subrotas do Pages

### Workflow automatico

Arquivo: `.github/workflows/deploy-gh-pages.yml`

Dispara em cada `push` no branch `main`:

1. checkout
2. setup Node 20
3. `npm install`
4. `npm run build`
5. publica `dist/` no branch `gh-pages`

## 2) Primeiro deploy

No seu computador:

```powershell
cd "C:\Users\emano\OneDrive\Documentos\Projetos Codex"
git add .
git commit -m "Deploy inicial"
git push
```

## 3) Acompanhar deploy

No GitHub:

1. abrir repositorio
2. aba `Actions`
3. abrir workflow `Deploy GitHub Pages`
4. conferir se o status ficou verde (`Success`)

## 4) Ativar Pages

No GitHub:

1. `Settings`
2. `Pages`
3. Source: `Deploy from a branch`
4. Branch: `gh-pages` e pasta `/ (root)`
5. salvar

URL esperada:

- `https://EmanoelMagalhaes.github.io/desperdicio-zero/`

## 5) Configurar variaveis para build Firebase

No repo:

- `Settings` -> `Secrets and variables` -> `Actions`

### Variables

- `VITE_BACKEND_PROVIDER` (`firebase` para modo online, `local` para modo MVP local)

### Secrets

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Sem isso, build pode subir mas app nao conecta no Firebase.

## 6) Deploy manual alternativo

Se quiser publicar manualmente pelo terminal:

```powershell
npm.cmd install
npm.cmd run deploy
```

Isso usa `gh-pages -d dist` (script em `package.json`).

## 7) Como validar depois de publicar

Checklist minimo:

1. home abre
2. cadastro de cliente funciona
3. login admin funciona
4. aprovacao de cliente funciona
5. menus mobile aparecem no celular
6. console do navegador sem erro critico

## 8) Problemas comuns

### Workflow nao aparece

- confirme se arquivo existe em `.github/workflows/deploy-gh-pages.yml`
- confirme push no branch `main`

### Workflow falha em build

- abra logs do job
- valide secrets e variables
- rode `npm.cmd run build` localmente para reproduzir

### Site antigo em cache

- force reload (Ctrl+F5)
- abra em aba anonima

## 9) Fluxo padrao recomendado para toda mudanca

1. alterar codigo
2. `npm.cmd run build`
3. `git add .`
4. `git commit -m "..."`
5. `git push`
6. verificar `Actions`
7. validar no URL publico
