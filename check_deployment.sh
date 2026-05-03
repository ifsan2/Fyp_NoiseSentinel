#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-https://noisesentinel.tech}"
HEALTH_URL="${DOMAIN%/}/api/health"
REGISTER_URL="${DOMAIN%/}/api/Auth/register/admin"

log() {
  printf '%s\n' "$1"
}

fail() {
  printf 'FAILED: %s\n' "$1" >&2
  exit 1
}

log "Checking portal root: ${DOMAIN%/}"
portal_body=$(curl -fsS "${DOMAIN%/}") || fail "Portal root is not reachable"
if ! printf '%s' "$portal_body" | grep -qi 'NoiseSentinel'; then
  fail "Portal root responded, but it does not look like the NoiseSentinel app"
fi

log "Checking API health: ${HEALTH_URL}"
health_body=$(curl -fsS "$HEALTH_URL") || fail "API health endpoint is not reachable"
if ! printf '%s' "$health_body" | grep -qi 'Healthy'; then
  fail "API health endpoint did not return Healthy"
fi

log "Checking API route mapping: ${REGISTER_URL}"
register_status=$(curl -sS -o /tmp/noisesentinel-register-response.txt -w '%{http_code}' \
  -X POST "$REGISTER_URL" \
  -H 'Content-Type: application/json' \
  -d '{}')

if [[ "$register_status" != "400" ]]; then
  printf 'Response body:\n'
  cat /tmp/noisesentinel-register-response.txt
  fail "Expected 400 from /api/Auth/register/admin, got ${register_status}"
fi

log "Deployment checks passed"
log "Portal: ${DOMAIN%/}"
log "API health: ${HEALTH_URL}"