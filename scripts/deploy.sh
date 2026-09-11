#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  echo "Usage: $0 <image-tag>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/.env"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file $ENV_FILE"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Create it on the server."
  exit 1
fi

touch "$ROOT_DIR/.last_successful_tag"
if [[ ! -s "$ROOT_DIR/.last_successful_tag" ]]; then
  echo "latest" > "$ROOT_DIR/.last_successful_tag"
fi

echo "$TAG" > "$ROOT_DIR/.deploying_tag"

# update IMAGE_TAG in .env
if grep -qE '^IMAGE_TAG=' "$ENV_FILE"; then
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/" "$ENV_FILE"
else
  echo "IMAGE_TAG=$TAG" >> "$ENV_FILE"
fi

echo "[deploy] Pull images..."
$COMPOSE pull

echo "[deploy] Up containers..."
$COMPOSE up -d --remove-orphans

echo "[deploy] Waiting for health via Nginx: http://127.0.0.1/api/health"
for i in {1..60}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    echo "[deploy] OK: new version is healthy: $TAG"
    echo "$TAG" > "$ROOT_DIR/.last_successful_tag"
    rm -f "$ROOT_DIR/.deploying_tag"
    exit 0
  fi
  sleep 2
done

echo "[deploy] ERROR: healthcheck failed. Rolling back..."
"$ROOT_DIR/scripts/rollback.sh"
exit 1