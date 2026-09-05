#!/usr/bin/env bash
# Start UnyDesk infra containers (no docker compose plugin required)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA="$ROOT/infra/rustdesk-server/data"
mkdir -p "$DATA"

docker rm -f unydesk-postgres unydesk-redis unydesk-hbbs unydesk-hbbr 2>/dev/null || true

docker run -d --name unydesk-postgres \
  -e POSTGRES_USER=unydesk -e POSTGRES_PASSWORD=unydesk -e POSTGRES_DB=unydesk \
  -p 5434:5432 \
  -v "$ROOT/unydesk-api/sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  --restart unless-stopped \
  postgres:16-alpine

docker run -d --name unydesk-redis \
  -p 6381:6379 \
  --restart unless-stopped \
  redis:7-alpine

HOST_IP="${UNYDESK_HOST_IP:-$(hostname -I | awk '{print $1}')}"

docker pull rustdesk/rustdesk-server:latest

docker run -d --name unydesk-hbbr \
  -p 21117:21117 -p 21117:21117/udp -p 21119:21119 \
  -v "$DATA:/root" \
  --restart unless-stopped \
  rustdesk/rustdesk-server:latest hbbr

docker run -d --name unydesk-hbbs \
  -p 21115:21115 -p 21116:21116 -p 21116:21116/udp -p 21118:21118 \
  -v "$DATA:/root" \
  --restart unless-stopped \
  rustdesk/rustdesk-server:latest hbbs -r "${HOST_IP}:21117"

echo "Waiting for postgres..."
sleep 4
docker ps --filter name=unydesk-
echo "Relay key (share with clients):"
cat "$DATA/id_ed25519.pub" 2>/dev/null || echo "(key appears after hbbs first start)"
