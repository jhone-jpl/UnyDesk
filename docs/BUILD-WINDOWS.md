# Build do cliente UnyDesk para Windows (CI)

Neste Linux **não** dá para gerar o `.exe`. Use o GitHub Actions:

## 1. Publique o monorepo no GitHub

```bash
cd /srv/projects/UnyDesk
# se ainda não tiver remote:
# gh repo create Unysystems/UnyDesk --private --source=. --push
git add -A
git status
git commit -m "Add UnyDesk Windows CI workflow"
git push -u origin HEAD
```

Garanta que `unydesk-client/` (incluindo `libs/hbb_common` **sem** `.git` aninhado, ou o job clona sozinho) e `.github/workflows/build-unydesk-windows.yml` estejam no remote.

## 2. Dispare o workflow

GitHub → **Actions** → **Build UnyDesk Windows** → **Run workflow**

Ou:

```bash
gh workflow run build-unydesk-windows.yml
```

## 3. Baixe o artefato

Quando terminar (~40–90 min na primeira vez por causa do vcpkg):

**Actions → run → Artifacts → `unydesk-windows-x64`**

Dentro: `rustdesk.exe` (nome interno do binário) + DLLs. A UI mostra **UnyDesk**.

## 4. Aponte para seu servidor

No cliente: Network → ID/Relay = host do hbbs, key = `infra/rustdesk-server/data/id_ed25519.pub`, API = `http://<host>:21114`.

Ou use `docs/client-server.example.toml`.
