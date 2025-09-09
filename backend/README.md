# IvyArc Backend (Refactored)

This backend is refactored for cloud-native operations with dynamic service discovery, OpenFeign for inter-service calls, and minimal container surface. Persistent data stores are external (managed DB/Redis/RabbitMQ). Compose files here run only the stateless Spring services.

## Highlights

- Dynamic discovery via Eureka + Spring Cloud LoadBalancer
- OpenFeign clients for service-to-service calls (no static ports)
- Centralized configuration via Spring Cloud Config
- Actuator health + liveness/readiness endpoints
- Minimal Docker images (non-root, JRE 21); optional GraalVM native builds
- No Dockerized persistent stores (use managed services)

## Layout

- `services` (existing code under `infrastructure` and `core-services` at project root)
- `deploy/compose/base.yml` — runs Eureka, Config Server, API Gateway, and core services
- `docs/` — detailed setup, Feign patterns, native build guide

## Prerequisites (External)

Provide these environment variables (in a `.env` file next to `base.yml` or in your orchestrator):

- `AUTH_DATABASE_URL`, `AUTH_DATABASE_USERNAME`, `AUTH_DATABASE_PASSWORD`
- `AUTHZ_DATABASE_URL`, `AUTHZ_DATABASE_USERNAME`, `AUTHZ_DATABASE_PASSWORD`
- `USER_DATABASE_URL`, `USER_DATABASE_USERNAME`, `USER_DATABASE_PASSWORD`
- `AUDIT_DATABASE_URL`, `AUDIT_DATABASE_USERNAME`, `AUDIT_DATABASE_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `RABBITMQ_ADDRESSES` (e.g. `amqps://user:pass@host1:5671/vhost,amqps://user:pass@host2:5671/vhost`)
- `JWT_SECRET`
- `CONFIG_SERVER_GIT_URI` (+ credentials if private)

## Build

Build JARs first (they are copied into runtime images):

```
# from project root
mvn -q -DskipTests package \
  -f infrastructure/service-discovery/pom.xml \
  -f infrastructure/config-server/pom.xml \
  -f infrastructure/api-gateway/pom.xml \
  -f core-services/auth-service/pom.xml \
  -f core-services/authorization-service/pom.xml \
  -f core-services/user-management-service/pom.xml \
  -f core-services/audit-service/pom.xml
```

## Run (Compose)

```
cd backend/deploy/compose
# ensure a .env with external endpoints is present
docker compose -f base.yml up -d --build
```

Only the API Gateway publishes a port (`8080`). All other services communicate on the internal network via Eureka.

## Health

- Eureka: `http://localhost:8761`
- Config: `http://localhost:8888/actuator/health`
- Gateway: `http://localhost:8080/actuator/health`
- Each service: `http://<container>:<port>/actuator/health`

## Native Images (optional)

Each service POM includes the GraalVM native build plugin. You can produce native binaries using buildpacks or the native-image tool. See `docs/native.md`.

## Notes

- All previous Dockerized persistent stores and their bind-mounts are deprecated and removed from this deployment path. Use managed cloud services.
- Service-to-service calls must use Feign interfaces and service IDs, not hard-coded URLs/ports.

