#!/usr/bin/env bash
# Smoke-test UnyDesk API against a running instance on :21114
set -euo pipefail
BASE="${UNYDESK_API:-http://127.0.0.1:21114}"

echo "== health =="
curl -sf "$BASE/health" | tee /tmp/unydesk-health.json
echo

echo "== login =="
TOKEN=$(curl -sf -X POST "$BASE/api/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"UnyDesk!admin","type":"account"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')
echo "token ok (${#TOKEN} chars)"

echo "== currentUser =="
curl -sf "$BASE/api/currentUser" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20

echo "== sysinfo (agent) =="
curl -sf -X POST "$BASE/api/sysinfo" -H 'Content-Type: application/json' \
  -d '{"id":"123456789","uuid":"dGVzdA==","hostname":"e2e-host","username":"tester","os":"linux","cpu":"test","memory":"8GB","version":"1.4.9"}'
echo

echo "== heartbeat =="
curl -sf -X POST "$BASE/api/heartbeat" -H 'Content-Type: application/json' \
  -d '{"id":"123456789","uuid":"dGVzdA==","ver":10409,"modified_at":0,"conns":[]}'
echo

echo "== devices =="
curl -sf "$BASE/api/devices" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -40

echo "== deploy token =="
curl -sf -X POST "$BASE/api/deploy-tokens" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"label":"e2e"}' | python3 -m json.tool

echo "OK"
