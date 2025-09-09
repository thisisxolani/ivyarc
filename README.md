# IvyArc

This repository contains a refactored backend and a separate frontend. The backend is cloud‑native, discovery‑based, and does not run persistent data stores in Docker. All stateful dependencies are external (managed) and configured via environment.

## Structure

- `backend/` — deployment and docs for the refactored backend
  - Services code remains in `infrastructure/` (Eureka, Config, Gateway) and `core-services/` (auth, authorization, user-management, audit)
  - Compose files under `backend/deploy/compose/`
  - Docs under `backend/docs/`
- `infrastructure/` — Spring Boot infrastructure services
- `core-services/` — Spring Boot core microservices
- `frontend/` — Angular application (frontend README covers only frontend specifics)

## Backend (prod-like)

1) Build service JARs (from repo root) and start the stack using external stores configured in `.env` next to the compose file:

- Build JARs:
  - See instructions in `backend/README.md` (uses Maven to package all services)
- Start services:
  - `cd backend/deploy/compose`
  - `cp .env.example .env` and edit values (temporary: admin/admin123)
  - Permanent stores installed on this server (apt):
    - Postgres 16: role `admin` / `admin123`; DBs: auth_db, authorization_db, user_management_db, audit_db
    - Redis 7: localhost:6379
    - RabbitMQ 3.12: vhost `ivyarc`; user `admin` / `admin123`
  - The `.env` is preconfigured to use `host.docker.internal` to reach these from containers.
  - `docker compose -f base.yml up -d --build`
- Start UIs for stores (optional):
  - `docker compose -f ui.yml up -d` (pgAdmin at `:5050`, Redis Commander at `:8088`)

Only API Gateway exposes a port (`8080`). Internal service routes are available for convenience:
- `http://localhost:8080/auth-service/**` → Auth Service
- `http://localhost:8080/authorization-service/**` → Authorization Service
- `http://localhost:8080/user-management-service/**` → User Management
- `http://localhost:8080/audit-service/**` → Audit Service

Health checks:
- Gateway: `http://localhost:8080/actuator/health`
- Per-service: `http://localhost:8080/<service>/actuator/health`

Unified Swagger UI:
- `docker compose -f ui.yml up -d swagger-ui`
- Visit `http://localhost:8089` (aggregates all service docs through Gateway)

Kubernetes UI (Headlamp, microk8s-friendly):
- `docker compose -f ui.yml up -d headlamp`
- Visit `http://localhost:4466` (mounts `~/.kube/config`)

## Frontend

See `frontend/README.md` for development and build instructions. Configure API base URLs via environment files or runtime config; this README does not describe backend setup.

## Notes

- Persistent Docker stores and legacy local-infra compose files have been removed. Use managed Postgres/Redis/RabbitMQ and configure endpoints via env.
- Secrets in compose `.env` are gitignored and intended for development; replace them for real environments.
