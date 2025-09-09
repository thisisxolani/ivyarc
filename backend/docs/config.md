# Configuration

All services read configuration from Spring Cloud Config (if provided) and environment variables. Avoid `localhost` defaults in production.

Key env vars:

- `EUREKA_DEFAULT_ZONE` — e.g. `http://eureka-server:8761/eureka`
- `SPRING_CLOUD_CONFIG_URI` — e.g. `http://config-server:8888`
- Database per service: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- Redis: `REDIS_HOST`, `REDIS_PORT`, optional `REDIS_PASSWORD`
- RabbitMQ: `SPRING_RABBITMQ_ADDRESSES`
- JWT: `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`

Expose only API Gateway to the outside. All other services communicate inside the network via discovery.

