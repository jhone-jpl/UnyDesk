# Build do cliente UnyDesk para Windows (CI)

Neste Linux **não** dá para gerar o `.exe`. Use o GitHub Actions.

## Disparo (recomendado: os dois juntos)

**Actions → Build UnyDesk Clients → Run workflow**  
(Linux + Windows em paralelo)

Ou só Windows: **Actions → Build UnyDesk Windows → Run workflow**

## Artefato

**Actions → run → Artifacts → `unydesk-windows-x64`**

Dentro: `rustdesk.exe` (nome interno) + DLLs. A UI mostra **UnyDesk**.

## Se falhar

No job **Build Windows x64**, abra o step vermelho e copie as **últimas ~40 linhas** (ou o `::error::`).

## Servidor

Network → ID/Relay = host do hbbs, key = `infra/rustdesk-server/data/id_ed25519.pub`, API = `http://<host>:21114`.
