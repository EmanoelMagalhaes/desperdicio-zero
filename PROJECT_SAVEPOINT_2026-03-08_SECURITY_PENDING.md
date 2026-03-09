# SAVEPOINT - 2026-03-08 (Seguranca pendente)

## Estado atual do projeto

- Repositorio online atualizado com documentacao (commit `36c4cef`).
- Tag estavel publicada: `versao-01`.
- Release publicada no GitHub: **Versao 01**.

## Novos arquivos locais gerados (ainda nao commitados)

- `docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.md`
- `docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.html`
- `docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.docx`
- `docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.pdf`
- `docs/tools/generate_manual.py`

## Pendencia critica de seguranca (NAO resolvida ainda)

GitHub Secret Scanning abriu alerta de **Google API Key vazada**.

Chave sinalizada:
- `AIzaSyDQNDC1sfuMl9kgIxoocAhgL8PHL1wLs-w`

Status:
- Ainda **nao rotacionada/revogada**.
- Alerta ainda **aberto** no GitHub.

## O que fazer quando voltar (ordem exata)

1. Rotacionar/revogar a chave no Google Cloud:
   - APIs & Services > Credentials > API key > Regenerate (ou criar nova e revogar antiga).

2. Restringir a nova chave:
   - Application restrictions: `HTTP referrers`:
     - `http://localhost:*`
     - `https://emanoelmagalhaes.github.io/*`
   - API restrictions: limitar somente APIs necessarias do Firebase.

3. Atualizar chave no projeto:
   - GitHub > Settings > Secrets and variables > Actions > `VITE_FIREBASE_API_KEY`.
   - Arquivo local `.env.local`.

4. Fazer novo deploy:
   - `git commit --allow-empty -m "chore: rotate firebase api key"`
   - `git push`

5. Fechar alerta no GitHub Security como `revoked/rotated`.

## Comandos para retomar rapidamente

```powershell
cd "C:\Users\emano\OneDrive\Documentos\Projetos Codex"
npm.cmd run dev
```

## Se quiser versionar o manual completo depois

```powershell
git add docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.* docs/tools/generate_manual.py
git commit -m "docs: adiciona manual completo em md/html/docx/pdf"
git push
```
