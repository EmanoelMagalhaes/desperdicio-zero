# Firebase - Operacao, Seguranca e Fluxos

Este guia explica como usar o Firebase neste projeto em nivel operacional.

## 1) Produtos Firebase usados

- **Authentication**: login por e-mail/senha, verificacao de e-mail e reset de senha.
- **Cloud Firestore**: banco NoSQL para usuarios, estoque, compras e desafios.

Nao usado no momento:
- Firebase Hosting (deploy atual esta no GitHub Pages)
- Cloud Functions
- Storage

## 2) Pre-requisitos

- projeto Firebase criado (ex: `desperdicio-zero-4fa38`)
- plano Spark (custo zero inicial)
- app web registrado no Firebase

## 3) Habilitar Authentication

No Firebase Console:

1. `Authentication`
2. `Get started`
3. aba `Sign-in method`
4. habilite `Email/Password`
5. salve

## 4) Dominios autorizados no Auth

Em `Authentication` -> `Settings` -> `Authorized domains`:

- `localhost`
- `emanoelmagalhaes.github.io`

Sem isso, podem ocorrer erros de dominio nao autorizado.

## 5) Criar Firestore

1. `Firestore Database`
2. `Create database`
3. edicao `Standard`
4. escolha local (recomendado manter um unico local por projeto)

## 6) Publicar regras do Firestore

Arquivo usado no repositorio: [`firestore.rules`](../firestore.rules)

No console:

1. Firestore -> `Rules`
2. apague tudo
3. cole o conteudo do arquivo
4. clique `Publish`

Regra atual (referencia):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    function userDoc(uid) {
      return get(/databases/$(database)/documents/users/$(uid));
    }

    function userRole() {
      return userDoc(request.auth.uid).data.role;
    }

    function isAdmin() {
      return isSignedIn() && userRole() == 'admin';
    }

    function isApprovedClient(uid) {
      return isOwner(uid) && userDoc(uid).data.approvalStatus == 'approved';
    }

    function isClientSelfRegistration(uid) {
      return isOwner(uid)
        && request.resource.data.role == 'client'
        && request.resource.data.approvalStatus == 'pending';
    }

    function isOwnerSafeProfileUpdate(uid) {
      return isOwner(uid)
        && request.resource.data.role == resource.data.role
        && request.resource.data.approvalStatus == resource.data.approvalStatus;
    }

    match /users/{uid} {
      allow create: if isClientSelfRegistration(uid) || isAdmin();
      allow read: if isOwner(uid) || isAdmin();
      allow update: if isAdmin() || isOwnerSafeProfileUpdate(uid);
      allow delete: if false;
    }

    match /clients/{clientId} {
      allow read, write: if isApprovedClient(clientId) || isAdmin();

      match /{document=**} {
        allow read, write: if isApprovedClient(clientId) || isAdmin();
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 7) Variaveis de ambiente locais

Arquivo local (nao commitar): `.env.local`

Modelo (igual ao `.env.example`):

```env
VITE_BACKEND_PROVIDER=firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 8) Variaveis no GitHub para deploy

No repo GitHub:

- `Settings` -> `Secrets and variables` -> `Actions`

### Variables

- `VITE_BACKEND_PROVIDER=firebase`

### Secrets

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 9) Estrutura de dados no Firestore

### Colecao `users`

Documento por UID do Auth:

- `role`: `client` ou `admin`
- `approvalStatus`: `pending`, `approved`, `rejected`
- `name`
- `email`
- `businessType`
- metadados (`createdAt`, `approvedAt`, etc.)

### Colecao `clients`

Subcolecoes por cliente:

- `clients/{uid}/inventory/{itemId}`
- `clients/{uid}/shopping/{itemId}`
- `clients/{uid}/meta/challenges`

## 10) Promover usuario para admin

1. Firestore -> `Dados`
2. colecao `users`
3. abra o doc do usuario (UID)
4. ajuste campos:
   - `role = admin`
   - `approvalStatus = approved`
5. salvar

Depois, esse usuario consegue logar como admin.

## 11) Fluxo de cliente pendente

- cadastro cria usuario com `approvalStatus = pending`;
- cliente recebe e-mail de verificacao;
- cliente NAO entra enquanto pendente;
- admin aprova em `/admin/clientes`;
- cliente aprovado entra normalmente.

## 12) Erros comuns

### `Permissao negada no Firestore`

Causas comuns:
- regras nao publicadas;
- documento `users/{uid}` sem `role/approvalStatus` esperados;
- usuario sem permissao para escrever no caminho.

### `Esse e-mail ja esta em uso`

Pode ocorrer quando:
- usuario ja existe no Auth;
- houve tentativa antiga incompleta.

O sistema atual tenta recuperar cadastro pendente quando possivel.

### Cliente cadastra com e-mail invalido

O Firebase Auth valida formato, mas nao confirma existencia real de caixa postal.
A confianca real vem da verificacao por link no e-mail (`emailVerified`).

## 13) Custo atual

Plano Spark costuma ser suficiente para fase inicial de testes.
Mesmo assim monitore:

- Firestore reads/writes
- Authentication MAU

Se crescer, avaliar upgrade para Blaze.

## 14) Arquivos de codigo relacionados

- `src/services/firebaseClient.js`
- `src/services/firebaseAuthService.js`
- `src/services/firebaseDataService.js`
- `src/hooks/useAppStore.jsx`
- `firestore.rules`
- `.env.example`
