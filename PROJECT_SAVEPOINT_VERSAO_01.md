# PROJECT SAVEPOINT - VERSAO 01

## Identificacao

- Nome: Versao 01
- Tag: `versao-01`
- Commit base: `68e51ce`
- Data: 2026-03-08

## Estado funcional incluido

- app web React + Vite organizada em arquitetura profissional;
- area publica, auth, cliente e admin;
- Firebase Authentication + Firestore ativos;
- aprovacao de clientes por administrador;
- verificacao de e-mail exigida para login de cliente;
- fluxo de esqueci minha senha;
- menu mobile por icones e responsividade melhorada;
- backup JSON exportavel via interface.

## Comandos para abrir exatamente esta versao

```bash
git fetch --all --tags
git switch -c abrir-versao-01 versao-01
npm.cmd install
npm.cmd run dev
```

## Comandos para restaurar main para esta versao

```bash
git switch main
git pull
git switch -c backup-antes-versao-01
git switch main
git reset --hard versao-01
git push --force-with-lease origin main
```

## Documentacao completa

Ver pasta [`docs/`](./docs/README.md).
