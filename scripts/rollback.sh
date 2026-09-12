#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/.env"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file $ENV_FILE -p mpt"

GOOD_SHA="$(cat "$ROOT_DIR/.last_successful_sha" 2>/dev/null | tr -d '[:space:]' || true)"
if [[ -z "$GOOD_SHA" ]]; then
  echo "ERROR: .last_successful_sha missing/empty"
  exit 1
fi

echo "[rollback] Rolling back to: $GOOD_SHA"

git fetch origin main
git checkout -f "$GOOD_SHA"
git reset --hard "$GOOD_SHA"

$COMPOSE up -d --build --remove-orphans

echo "[rollback] Checking health..."
for i in {1..60}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    echo "[rollback] OK"
    exit 0
  fi
  sleep 2
done

echo "[rollback] ERROR: rollback failed too"
exit 1
