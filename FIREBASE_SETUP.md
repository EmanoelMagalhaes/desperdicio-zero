# Firebase Setup - Desperdicio Zero

Este arquivo registra os passos para finalizar a fase 1 (auth + banco real).

## 1) Confirmar variaveis locais

O arquivo `.env.local` ja foi criado com as chaves do projeto Firebase para rodar no seu PC.

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

1. Acesse o app e registre uma conta normal (client)
2. Firebase Console > Firestore Database > Data > colecao `users`
3. Abra o documento do usuario criado (id = uid do Auth)
4. Altere o campo `role` para `admin`
5. Salve
6. Faça logout/login e use "Area admin" na tela de login

## 5) Estrutura de dados usada no app

- `users/{uid}`
  - role: `client` ou `admin`
  - name
  - email
  - businessType

- `clients/{uid}/inventory/{itemId}`
- `clients/{uid}/shopping/{itemId}`
- `clients/{uid}/meta/challenges`

## 6) Comandos locais

```powershell
npm.cmd run dev
npm.cmd run build
```

## 7) Deploy

```powershell
git add .
git commit -m "Integracao Firebase fase 1"
git push
```

O workflow publica automaticamente no GitHub Pages.
