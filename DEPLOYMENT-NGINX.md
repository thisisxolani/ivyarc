# IvyArc Deployment via Nginx + Let’s Encrypt

This guide shows how to serve the Angular app and proxy API requests through the API Gateway at `https://ivyarc.pro`.

## 1) DNS
- Create an A record: `ivyarc.pro` → your server’s public IPv4.
- Optional: AAAA record for IPv6.

## 2) Build and Start Services
- Copy `.env.example` to `.env` and set strong secrets. Important:
  - `SPRING_PROFILES_ACTIVE=production`
  - `CORS_ALLOWED_ORIGINS=https://ivyarc.pro`
  - Set secure values for `POSTGRES_PASSWORD`, `RABBITMQ_PASSWORD`, `JWT_SECRET`, etc.

- Start infra, then services (from `workspace/ivyarc/`):
  - `docker compose -f docker-compose.infrastructure.yml up -d`
  - `docker compose -f docker-compose.infrastructure.yml -f docker-compose.services.yml -f docker-compose.production.yml up -d`

Health checks:
- `curl -fsS http://localhost:8080/actuator/health` → should be `{ "status": "UP" }`
- `docker compose ps` → all containers healthy
- Eureka: `http://localhost:8761` (should list registered services)

## 3) Frontend Build
From `workspace/ivyarc/frontend/`:
- `npm ci`
- `npm run build`
Artifacts will be in `workspace/ivyarc/frontend/dist/auth-dashboard/`.

## 4) Nginx (system package)
Install Nginx on the server (Ubuntu/Debian):
- `sudo apt-get update && sudo apt-get install -y nginx`

Create site config `/etc/nginx/sites-available/ivyarc`:

```
server {
  listen 80;
  server_name ivyarc.pro www.ivyarc.pro;
  return 301 https://ivyarc.pro$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ivyarc.pro;

  # Managed by Certbot after issuance
  ssl_certificate /etc/letsencrypt/live/ivyarc.pro/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ivyarc.pro/privkey.pem;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  root /root/workspace/ivyarc/frontend/dist/auth-dashboard;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
    expires 1d;
  }

  # API → Spring Cloud Gateway
  location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
  }

  location /health {
    proxy_pass http://localhost:8080/actuator/health;
    access_log off;
  }
}
```

Enable and test:
- `sudo ln -s /etc/nginx/sites-available/ivyarc /etc/nginx/sites-enabled/`
- `sudo nginx -t && sudo systemctl reload nginx`

## 5) TLS via Let’s Encrypt (Certbot)
- `sudo apt-get install -y certbot python3-certbot-nginx`
- `sudo certbot --nginx -d ivyarc.pro -d www.ivyarc.pro`
- Auto-renew: `systemctl list-timers | grep certbot` (should be present)

## 6) Frontend → Gateway
The frontend calls the API via relative paths under `/api/*`. Nginx proxies to the Gateway, which routes:
- `/api/v1/auth/*` → `auth-service`
- `/api/v1/users/*` → `user-management-service`
- `/api/v1/auth/roles/*`, `/api/v1/auth/permissions/*` → `authorization-service`

Ensure your `.env` contains `CORS_ALLOWED_ORIGINS=https://ivyarc.pro` for services that enforce CORS.

## 7) Troubleshooting
- `curl -I https://ivyarc.pro` → 200 and valid certificate
- `curl -fsS http://localhost:8080/actuator/gateway/routes` → routes present
- `docker logs -f ivyarc-api-gateway` → look for errors
- `journalctl -u nginx -e` → web server logs

