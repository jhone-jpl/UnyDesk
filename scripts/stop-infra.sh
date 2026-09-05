#!/usr/bin/env bash
set -euo pipefail
docker rm -f unydesk-postgres unydesk-redis unydesk-hbbs unydesk-hbbr 2>/dev/null || true
echo "UnyDesk infra stopped"
