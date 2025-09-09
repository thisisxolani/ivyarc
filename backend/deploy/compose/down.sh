#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if docker compose version >/dev/null 2>&1; then
  docker compose -f base.yml down -v --remove-orphans || true
  docker compose -f ui.yml down -v --remove-orphans || true
else
  echo "[ERROR] Docker Compose v2 plugin not found."
  exit 1
fi

echo "[INFO] Stopped and cleaned."

