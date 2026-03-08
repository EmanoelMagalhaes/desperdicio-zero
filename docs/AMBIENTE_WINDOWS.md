# Ambiente Windows - Passo a Passo Completo

Este guia e para rodar o projeto do zero em um computador Windows.

## 1) O que precisa instalar

### Node.js

Para que serve:
- executa ferramentas JavaScript no computador;
- roda Vite (servidor local e build);
- instala dependencias com npm.

Versao recomendada neste projeto:
- Node >= 20
- npm >= 10

Como verificar:

```powershell
node -v
npm.cmd -v
```

### Git

Para que serve:
- controlar historico de codigo;
- salvar versoes;
- enviar projeto para GitHub.

Como verificar:

```powershell
git --version
```

### PowerShell

Ja vem no Windows. Sera usado para os comandos.

## 2) Problema comum no Windows (Execution Policy)

Erro comum:

- `npm : ... npm.ps1 nao pode ser carregado porque a execucao de scripts foi desabilitada`

Solucao pratica:

- usar `npm.cmd` no lugar de `npm`.

Exemplo:

```powershell
npm.cmd install
npm.cmd run dev
```

## 3) Abrir o projeto

```powershell
cd "C:\Users\emano\OneDrive\Documentos\Projetos Codex"
```

## 4) Instalar dependencias

```powershell
npm.cmd install
```

Isso instala tudo de `package.json` na pasta `node_modules`.

## 5) Rodar localmente

```powershell
npm.cmd run dev -- --clearScreen false
```

Saida esperada:
- URL local, normalmente `http://localhost:5173/`

Abra no navegador e teste a aplicacao.

## 6) Build de producao

```powershell
npm.cmd run build
```

Gera a pasta `dist/` com os arquivos finais do site.

## 7) Preview local da build

```powershell
npm.cmd run preview
```

Serve para validar a versao otimizada antes do deploy.

## 8) Estrutura local importante

- `node_modules/`: bibliotecas instaladas (nao commitar)
- `dist/`: build final (nao commitar)
- `.env.local`: chaves locais (nao commitar)

## 9) Comandos Git basicos

Salvar alteracoes:

```powershell
git add .
git commit -m "mensagem clara da mudanca"
git push
```

Ver estado:

```powershell
git status
git log --oneline -n 10
```

## 10) Erros comuns e correcoes

### Nao aparece nada apos `npm.cmd run dev`

- pressione `Enter` no terminal;
- rode de novo com `--clearScreen false`;
- confirme se esta na pasta correta do projeto.

### Porta ocupada

- feche outro processo que usa 5173;
- ou rode com outra porta:

```powershell
npm.cmd run dev -- --port 5174
```

### Dependencia nao encontrada

```powershell
npm.cmd install
```

Se persistir:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm.cmd install
```

## 11) Checklist rapido diario

1. `git pull`
2. `npm.cmd install` (se mudou package-lock)
3. `npm.cmd run dev`
4. desenvolver
5. `npm.cmd run build`
6. `git add/commit/push`
