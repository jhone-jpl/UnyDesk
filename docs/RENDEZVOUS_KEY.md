# Rendezvous / relay public key

After starting infra (`./scripts/start-infra.sh`), the hbbs public key is at:

`infra/rustdesk-server/data/id_ed25519.pub`

Configure UnyDesk clients with that value as `key`, and the host running hbbs
as `custom-rendezvous-server`. See `docs/client-server.example.toml`.

Do not distribute `id_ed25519` (private key).
