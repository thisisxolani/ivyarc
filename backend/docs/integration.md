# Backend Integration Guide

This guide explains how to integrate with the IvyArc backend, add/refactor services, and build UIs against the APIs.

## Concepts

- Gateway as single entry: All external traffic goes through API Gateway (port 8080).
- Discovery: Simple Discovery Client + explicit gateway routes; no registry.
- Service IDs: Use logical names (auth-service, authorization-service, user-management-service, audit-service).
- Async + cache: RabbitMQ (ivyarc vhost), Redis for caching/sessions.
- Persistence: Postgres per service DB, managed externally.

## Environments

- Permanent services (installed via apt on the host):
  - Postgres 16: `admin/admin123`; DBs: `auth_db`, `authorization_db`, `user_management_db`, `audit_db`
  - Redis 7: `localhost:6379`
  - RabbitMQ 3.12: `amqp://admin:admin123@localhost:5672/ivyarc`
- Containers reach them via `host.docker.internal`.

## Endpoints via Gateway

- Auth: `http://localhost:8080/auth-service/**`
- Authorization: `http://localhost:8080/authorization-service/**`
- User Mgmt: `http://localhost:8080/user-management-service/**`
- Audit: `http://localhost:8080/audit-service/**`

Health:
- Gateway: `/actuator/health`
- Per service (through gateway): `/<service>/actuator/health`

Docs:
- Swagger UI aggregator: `http://localhost:8089`

## API Conventions

- Problem+JSON error responses
- RESTful paths, nouns, standard verbs
- Pagination via `page`,`size`,`sort`
- Validation → 422 UnprocessableEntity
- AuthZ tokens via Authorization header `Bearer <token>`

## Adding a New Service

1. Scaffold Spring Boot 3.2 + Spring Cloud 2023.x
2. Dependencies:
   - `spring-boot-starter-web`
   - `spring-boot-starter-actuator`
   - Data: JPA + PostgreSQL (or as needed)
   - Metrics: micrometer-registry-prometheus (optional)
   - Discovery: Use service ID; Feign as needed
3. Config:
   - Set `spring.application.name=<service-id>`
   - Datasource via env: `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`
   - Expose actuator: health, info, metrics, prometheus
4. Security:
   - Permit: `/actuator/health`, `/actuator/info`, swagger if needed
   - Add JWT/filters as required
5. Feign (optional):
   - `@EnableFeignClients` in main class
   - `@FeignClient(name="other-service", path="/api/...")`
6. Register route in Gateway (without rebuilding):
   - Add env vars in `backend/deploy/compose/base.yml` under `api-gateway`:
     - `SPRING_CLOUD_GATEWAY_ROUTES_N_ID`, `..._URI`, `..._PREDICATES_0`, `..._FILTERS_0`
   - Or add YAML routes then rebuild gateway.
7. Build + run:
   - `mvn -DskipTests package` per module
   - `docker compose -f base.yml up -d --build`

## Refactoring a Service

- Keep `spring.application.name` stable (affects routes/service ID)
- Update controller paths; sync gateway route if paths change
- Update Flyway migrations for DB changes
- Maintain Problem+JSON handlers for consistent errors

## Frontend Integration

- Use Gateway base URL: `http://localhost:8080`
- Auth flows: obtain JWT from Auth Service, pass `Authorization: Bearer <token>`
- CORS: Gateway is configured for common dev origins; update `application.yml` if needed.

## Observability

- Health: actuator endpoints
- Metrics: `/actuator/prometheus` (per service)
- Tracing: Zipkin-ready (configure URL when available)

## Configuration Summary (env)

- Postgres: `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`
- Redis: `REDIS_HOST/REDIS_PORT`
- RabbitMQ: `SPRING_RABBITMQ_ADDRESSES`
- JWT: `JWT_SECRET`, `JWT_*_EXPIRATION`

