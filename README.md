# UnyDesk — Hybrid remote desktop platform

| Component | Path | License |
|-----------|------|---------|
| Client (agent) | [`unydesk-client/`](unydesk-client/) | **AGPL-3.0** (based on RustDesk 1.4.9) |
| ID / Relay | [`infra/`](infra/) (`hbbs`/`hbbr`) | Upstream rustdesk-server (AGPL) |
| Management API | [`unydesk-api/`](unydesk-api/) | **Proprietary** Unysystems |
| Web console | [`unydesk-console/`](unydesk-console/) | **Proprietary** Unysystems |

See [`docs/LEGAL.md`](docs/LEGAL.md).

## Quick start

```bash
# 1) Infra (Postgres :5434, Redis :6381, hbbs/hbbr :21115–21119)
./scripts/start-infra.sh

# 2) API
cd unydesk-api && cp -n .env.example .env && npm install && npm run dev

# 3) Console
cd unydesk-console && npm install && npm run dev
# → http://localhost:5173  (admin / UnyDesk!admin)
```

Client defaults: set `api-server` to `http://<host>:21114` and rendezvous to `<host>` with the key in `infra/rustdesk-server/data/id_ed25519.pub`.

Signing keys for white-label `custom.txt` live in `keys/` (gitignored secrets).

## Build cliente Windows

Não compila neste Linux. Use GitHub Actions:

→ [`docs/BUILD-WINDOWS.md`](docs/BUILD-WINDOWS.md)  
→ workflow [`.github/workflows/build-unydesk-windows.yml`](.github/workflows/build-unydesk-windows.yml)  
→ artefato `unydesk-windows-x64`
