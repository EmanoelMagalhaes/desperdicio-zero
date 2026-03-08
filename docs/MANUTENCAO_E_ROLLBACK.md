# Manutencao e Rollback

Guia pratico para manter o projeto estavel sem perder historico.

## 1) Estrategia de versao

- baseline atual: `versao-01`
- proxima recomendada: tag `versao-02` quando fechar novo ciclo estavel

## 2) Fluxo seguro para alterar codigo

1. atualizar main:

```bash
git switch main
git pull
```

2. criar branch de trabalho:

```bash
git switch -c codex/nome-da-mudanca
```

3. desenvolver e validar:

```bash
npm.cmd run dev
npm.cmd run build
```

4. commitar:

```bash
git add .
git commit -m "descricao objetiva"
```

5. publicar branch ou mergear no main.

## 3) Como criar uma nova versao estavel

```bash
git switch main
git pull
git tag -a versao-02 -m "Versao 02 - descricao"
git push origin versao-02
```

## 4) Como voltar para versao anterior

### Caso A: desfazer 1 commit ruim sem destruir historico

```bash
git switch main
git pull
git revert <hash>
git push
```

### Caso B: restaurar estado inteiro da tag

```bash
git switch main
git pull
git switch -c backup-antes-rollback
git switch main
git reset --hard versao-01
git push --force-with-lease origin main
```

Use apenas quando necessario e com backup.

## 5) Como recuperar alteracao local perdida

Ver reflog:

```bash
git reflog
```

Voltar para um ponto:

```bash
git switch -c resgate-<data> <hash-do-reflog>
```

## 6) Backup de dados da aplicacao

### Backup funcional no app

No painel logado, usar botao `Exportar backup`.

Arquivo gerado:
- JSON com inventario, compras, desafios e metadados do cliente ativo.

### Backup Firebase (manual)

- export nativo do Firestore pode exigir GCP tooling;
- para fase atual, manter backups JSON periodicos ja reduz risco.

## 7) Checklist antes de cada deploy

1. `npm.cmd run build` sem erro
2. telas criticas testadas (login/register/admin)
3. regras Firestore atualizadas se houve mudanca de permissao
4. commit claro
5. push
6. workflow verde no GitHub Actions

## 8) Checklist apos deploy

1. abrir URL publica
2. testar login cliente
3. testar login admin
4. testar aprovacao de cliente
5. testar fluxo mobile rapido
6. checar console do navegador

## 9) Convencao de commit recomendada

Padrao simples:

- `feat: ...` nova funcionalidade
- `fix: ...` correcao
- `refactor: ...` reorganizacao
- `docs: ...` documentacao

## 10) Quando envolver outro desenvolvedor

Passe no handoff:

- link do repo
- link desta pasta `docs/`
- tag estavel atual
- regras Firestore em uso
- lista de segredos necessarios no GitHub
