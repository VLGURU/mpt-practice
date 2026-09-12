#!/usr/bin/env bash
set -euo pipefail

SHA="${1:-}"
if [[ -z "$SHA" ]]; then
  echo "Usage: $0 <git-sha>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/.env"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file $ENV_FILE -p mpt"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

touch "$ROOT_DIR/.last_successful_sha"
if [[ ! -s "$ROOT_DIR/.last_successful_sha" ]]; then
  echo "$SHA" > "$ROOT_DIR/.last_successful_sha"
fi

echo "$SHA" > "$ROOT_DIR/.deploying_sha"

echo "[deploy] Checkout commit $SHA"
git fetch origin main
git checkout -f "$SHA"
git reset --hard "$SHA"

echo "[deploy] Build & up..."
$COMPOSE up -d --build --remove-orphans

echo "[deploy] Waiting for health via Nginx: http://127.0.0.1/api/health"
for i in {1..60}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    echo "[deploy] OK: healthy sha: $SHA"
    echo "$SHA" > "$ROOT_DIR/.last_successful_sha"
    rm -f "$ROOT_DIR/.deploying_sha"
    exit 0
  fi
  sleep 2
done

echo "[deploy] ERROR: health failed. Rolling back..."
"$ROOT_DIR/scripts/rollback.sh"
exit 1
