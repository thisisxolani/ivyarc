#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

COMPOSE_BIN="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] Docker Compose v2 (plugin) not found. Install it, or run:"
  echo "  sudo apt-get update && sudo apt-get install -y docker-compose-plugin"
  echo "Or install manually to ~/.docker/cli-plugins/docker-compose"
  exit 1
fi

echo "[INFO] Using: $(docker compose version)"

echo "[INFO] Bringing up UI tools (pgAdmin, Redis Commander)"
$COMPOSE_BIN -f ui.yml up -d --remove-orphans

echo "[INFO] Bringing up backend services"
$COMPOSE_BIN -f base.yml down -v || true
$COMPOSE_BIN -f base.yml up -d --build --remove-orphans

echo "[INFO] Stack status:"
$COMPOSE_BIN -f base.yml ps
$COMPOSE_BIN -f ui.yml ps

echo "[INFO] Gateway:     http://localhost:${API_GATEWAY_PORT:-8080}/actuator/health"
echo "[INFO] Eureka:      http://localhost:8761 (when enabled)"
echo "[INFO] pgAdmin:     http://localhost:${PGADMIN_PORT:-5050}"
echo "[INFO] Redis UI:    http://localhost:${REDIS_COMMANDER_PORT:-8088}"

