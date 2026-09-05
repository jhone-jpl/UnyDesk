# UnyDesk API

Proprietary management API for UnyDesk (Unysystems). Communicates with the
AGPL UnyDesk client over HTTP only — no shared code with the client.

## Endpoints (MVP)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/login-options` | no |
| POST | `/api/login` | no |
| POST | `/api/logout` | Bearer |
| GET | `/api/currentUser` | Bearer |
| POST | `/api/heartbeat` | no (agent) |
| POST | `/api/sysinfo` | no (agent) |
| POST | `/api/sysinfo_ver` | no (agent) |
| GET | `/api/devices` | Bearer |
| POST | `/api/devices/:guid/disable` | Bearer |
| POST | `/api/devices/:guid/enable` | Bearer |
| POST | `/api/devices/:guid/assign` | Bearer |
| DELETE | `/api/devices/:guid` | Bearer |
| POST | `/api/devices/deploy` | Bearer (deploy token or user) |
| POST | `/api/devices/cli` | Bearer |
| GET/POST | `/api/users` | Bearer admin |
| POST | `/api/users/:guid/disable\|enable` | Bearer admin |
| DELETE | `/api/users/:guid` | Bearer admin |
| POST | `/api/deploy-tokens` | Bearer admin |

Default admin: `admin` / `UnyDesk!admin`
