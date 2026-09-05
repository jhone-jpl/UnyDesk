# Ports used by UnyDesk
#
# 21114  — unydesk-api (proprietary management API)
# 21115  — hbbs NAT test
# 21116  — hbbs ID / rendezvous (TCP+UDP)
# 21117  — hbbr relay
# 21118  — hbbs WebSocket
# 21119  — hbbr WebSocket
# 5432   — PostgreSQL
# 6379   — Redis
# 5173   — unydesk-console (dev)
#
# After first `docker compose up`, read the public key from:
#   infra/rustdesk-server/data/id_ed25519.pub
# Configure clients with that key + this host as custom-rendezvous-server.
