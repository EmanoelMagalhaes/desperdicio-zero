# Firebase Setup - Desperdicio Zero

Este arquivo registra os passos para finalizar a fase atual (auth + banco real + aprovacao de clientes).

## 1) Confirmar variaveis locais

O arquivo `.env.local` deve ter as chaves do projeto Firebase para rodar no seu PC.

## 2) Configurar variaveis no GitHub (deploy)

1. GitHub > Repository > Settings > Secrets and variables > Actions
2. Em **Variables**, crie:
   - `VITE_BACKEND_PROVIDER` = `firebase`
3. Em **Secrets**, crie:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Os valores sao os mesmos do `firebaseConfig` do console Firebase.

## 3) Publicar regras do Firestore

1. Firebase Console > Firestore Database > Rules
2. Copie o conteudo de `firestore.rules`
3. Clique em Publish

## 4) Criar primeiro admin real

1. Acesse o app e registre uma conta normal (cliente)
2. Firebase Console > Firestore Database > Data > colecao `users`
3. Abra o documento do usuario criado (id = uid do Auth)
4. Altere os campos:
   - `role` = `admin`
   - `approvalStatus` = `approved`
5. Salve
6. Faça logout/login e use "Area admin" na tela de login

## 5) Fluxo de aprovacao de clientes

- Cadastro publico (`/register`): cria cliente com `approvalStatus = pending`
- Cliente pendente nao consegue entrar na area do cliente
- Admin pode aprovar/reprovar no menu **Gerenciar clientes**
- Admin tambem pode cadastrar cliente novo direto no painel (ja aprovado)

## 6) Estrutura de dados usada no app

- `users/{uid}`
  - role: `client` ou `admin`
  - approvalStatus: `pending`, `approved` ou `rejected`
  - name
  - email
  - businessType

- `clients/{uid}/inventory/{itemId}`
- `clients/{uid}/shopping/{itemId}`
- `clients/{uid}/meta/challenges`

## 7) Comandos locais

```powershell
npm.cmd run dev
npm.cmd run build
```

## 8) Deploy

```powershell
git add .
git commit -m "Fluxo de aprovacao de clientes + cadastro admin"
git push
```

O workflow publica automaticamente no GitHub Pages.
