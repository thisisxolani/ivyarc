#!/usr/bin/env bash
set -euo pipefail

# Starts the Angular/Vite dev server on port 4200 in the background
# Logs to /var/log/ivyarc-vite.log if writable, else ./vite.log

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../frontend" && pwd)"
# Always log inside the repo to avoid /var/log permission issues
LOG_FILE="$FRONTEND_DIR/vite.log"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Frontend directory not found: $FRONTEND_DIR" >&2
  exit 1
fi

echo "Logging to: $LOG_FILE"

echo "[1/3] Checking Node.js…"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please install Node >= 20.10.0." >&2
  exit 1
fi

NODE_MAJOR="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
if (( NODE_MAJOR < 20 )); then
  echo "Node.js $(node -v) is too old. Require >= 20.10.0" >&2
  exit 1
fi

echo "[2/3] Installing dependencies (npm ci)…"
cd "$FRONTEND_DIR"
if [[ ! -d node_modules ]]; then
  npm ci
fi

echo "[3/3] Starting Vite dev server on 0.0.0.0:4200…"
NOHUP_BIN="nohup"
if ! command -v nohup >/dev/null 2>&1; then
  NOHUP_BIN=""
fi

# Kill existing vite on 4200 if running
if command -v lsof >/dev/null 2>&1 && lsof -iTCP:4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
  PID_TO_KILL="$(lsof -iTCP:4200 -sTCP:LISTEN -t | head -n1)"
  echo "Port 4200 in use by PID $PID_TO_KILL. Attempting to stop…"
  kill "$PID_TO_KILL" || true
  sleep 1
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 start "npm run dev" --name ivyarc-vite --update-env || true
else
  if [[ -n "$NOHUP_BIN" ]]; then
    $NOHUP_BIN npm run dev >"$LOG_FILE" 2>&1 &
  else
    (npm run dev >"$LOG_FILE" 2>&1 &)
  fi
fi

# Wait for server to listen
echo -n "Waiting for dev server to accept connections"
for i in {1..60}; do
  if curl -fsS "http://127.0.0.1:4200/" >/dev/null 2>&1 || curl -fsS "http://localhost:4200/" >/dev/null 2>&1; then
    echo -e "\nDev server is up."
    exit 0
  fi
  echo -n "."
  sleep 1
done

echo -e "\nDev server did not start in time. Check logs: $LOG_FILE" >&2
exit 1
