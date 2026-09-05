# Build do cliente UnyDesk para Windows (CI)

Neste Linux **não** dá para gerar o `.exe`. Use o GitHub Actions.

## Diagnóstico do run ~49 min que falhou

Aquelas annotations batem com:

| Annotation | Significado |
|------------|-------------|
| `Failed to restore/save` Cache **400** / “services aren't available” | Cache binário **vcpkg `x-gha`** quebrado (API do Actions Cache). Quase sempre depois de ~40–60 min compilando ports. |
| `libyuv` “MSVC … very slow” | Aviso do port overlay; **não** é o exit 1. |
| Node.js 20 deprecated | Só warning. |
| `WindowInjection.dll` | Opcional; job com `continue-on-error`. |

Ou seja: **não faltava Flutter/Rust/versão** — o ponto frágil era o cache `x-gha` + falta de higiene (disco, path Windows do cache, `vcpkgJsonGlob`, verificação do bridge / `hbb_common`).

## 1. Dispare

GitHub → **Actions** → **Build UnyDesk Windows** → **Run workflow**

```bash
gh workflow run build-unydesk-windows.yml
```

## 2. Artefato

**Actions → run → Artifacts → `unydesk-windows-x64`**

Dentro: `rustdesk.exe` (nome interno) + DLLs. A UI mostra **UnyDesk**.

## 3. Se falhar de novo

No job **Build Windows x64**, abra o step vermelho e copie as **últimas ~40 linhas** (ou o `::error::`). Com isso dá para ver se foi `vcpkg`, `cargo` ou `flutter build`.

## 4. Servidor

Network → ID/Relay = host do hbbs, key = `infra/rustdesk-server/data/id_ed25519.pub`, API = `http://<host>:21114`.
