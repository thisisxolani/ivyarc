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
  - `docker-compose -f base.yml up -d --build`
- Start UIs for stores (optional):
  - `docker-compose -f ui.yml up -d` (pgAdmin at `:5050`, Redis Commander at `:8088`)

Only API Gateway exposes a port (`8080`). All service-to-service calls use Eureka + OpenFeign; no static port wiring.

## Frontend

See `frontend/README.md` for development and build instructions. Configure API base URLs via environment files or runtime config; this README does not describe backend setup.

## Notes

- Persistent Docker stores and legacy local-infra compose files have been removed. Use managed Postgres/Redis/RabbitMQ and configure endpoints via env.
- Secrets in compose `.env` are gitignored and intended for development; replace them for real environments.
