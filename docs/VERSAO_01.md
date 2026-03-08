# Versao 01 - Baseline Estavel

Este documento formaliza o marco de estabilidade solicitado por voce.

## Identificacao da versao

- Nome da versao: `Versao 01`
- Tag Git: `versao-01`
- Commit de referencia: `68e51ce`
- Data de criacao da tag: 2026-03-08

## O que esta incluido na Versao 01

- arquitetura React organizada em camadas (`components`, `pages`, `services`, `hooks`, `utils`, `data`);
- roteamento por area (publica, auth, cliente, admin);
- fluxo de cadastro/login com Firebase Authentication;
- fluxo de aprovacao de clientes por administrador;
- bloqueio de cliente pendente/reprovado;
- verificacao de e-mail para login de cliente;
- recuperacao de senha (esqueci minha senha);
- area admin com cadastro de clientes e aprovacao;
- backup manual por exportacao JSON;
- layout responsivo com menu mobile por icones;
- deploy automatico para GitHub Pages via GitHub Actions.

## Como voltar para a Versao 01 (sem sobrescrever nada)

Use quando quiser abrir uma copia estavel para teste:

```bash
git fetch --all --tags
git switch -c teste-versao-01 versao-01
```

Isso cria um branch novo a partir da versao estavel.

## Como restaurar o projeto principal para a Versao 01

Use quando voce quiser que o `main` volte ao estado da versao estavel.

Opcao segura (recomendada):

1. criar branch de backup do estado atual;
2. resetar localmente para a tag;
3. publicar com `--force-with-lease`.

```bash
git switch main
git pull
git switch -c backup-antes-rollback
git switch main
git reset --hard versao-01
git push --force-with-lease origin main
```

## Se quiser apenas desfazer uma mudanca ruim recente

Use `git revert` em vez de rollback total:

```bash
git switch main
git pull
git revert <hash-do-commit-ruim>
git push
```

## Boas praticas para proximas versoes

- ao fechar cada marco estavel, crie nova tag (`versao-02`, `versao-03`, etc.);
- atualize este documento com commit e funcionalidades;
- nunca faca alteracoes grandes sem commit intermediario.
