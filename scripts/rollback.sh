#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/.env"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file $ENV_FILE"

if [[ ! -f "$ROOT_DIR/.last_successful_tag" ]]; then
  echo "ERROR: .last_successful_tag not found"
  exit 1
fi

GOOD_TAG="$(cat "$ROOT_DIR/.last_successful_tag" | tr -d '[:space:]')"
if [[ -z "$GOOD_TAG" ]]; then
  echo "ERROR: last successful tag is empty"
  exit 1
fi

echo "[rollback] Rolling back to: $GOOD_TAG"

if grep -qE '^IMAGE_TAG=' "$ENV_FILE"; then
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$GOOD_TAG/" "$ENV_FILE"
else
  echo "IMAGE_TAG=$GOOD_TAG" >> "$ENV_FILE"
fi

$COMPOSE pull || true
$COMPOSE up -d --remove-orphans

echo "[rollback] Checking health..."
for i in {1..60}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    echo "[rollback] OK: rollback version is healthy"
    exit 0
  fi
  sleep 2
done

echo "[rollback] ERROR: rollback healthcheck failed too"
exit 1