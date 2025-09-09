#!/usr/bin/env bash
set -euo pipefail

# Wrapper: start Vite dev server and apply Nginx reverse proxy for ivyarc.pro

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$HERE/start-frontend-dev.sh"

# If a container name is passed, export for downstream script
if [[ $# -gt 0 ]]; then
  export NGINX_CONTAINER_NAME="$1"
fi

bash "$HERE/nginx/update-ivyarc-pro-proxy.sh"

echo "All set. Open https://ivyarc.pro/"

