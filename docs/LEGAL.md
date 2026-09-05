# UnyDesk — legal boundary

## Open source (must publish source when distributing)

- **unydesk-client/** — modified RustDesk, **AGPL-3.0**. See `unydesk-client/LICENCE` and `unydesk-client/NOTICE.UnyDesk.md`.
- **rustdesk-server** (hbbs/hbbr) — upstream AGPL; we run the published images/binaries.

AGPL §13: if you distribute the UnyDesk client (or let users interact with a modified network version), you must offer the corresponding source of that client.

## Proprietary (Unysystems)

- **unydesk-api/** — HTTP management API. Separate program; no linking to the AGPL client.
- **unydesk-console/** — web UI. Separate program; talks to the API over HTTP/JSON only.

Do **not** copy AGPL client source into the proprietary repos. The HTTP contract is documented by client behavior and by the Python API examples under `unydesk-client/res/*.py` (used as specification only).

## Trademarks

UnyDesk / Unysystems branding must not use RustDesk logos or claim endorsement by Purslane Tech / RustDesk.
