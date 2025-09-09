# Service-to-Service via OpenFeign

All core services enable `@EnableFeignClients` and should declare Feign interfaces to call other services by service ID, not host:port. Discovery is provided by Eureka with Spring Cloud LoadBalancer.

Example:

```java
@FeignClient(name = "authorization-service", path = "/api/roles")
public interface AuthorizationClient {
  @GetMapping("/current")
  RolesResponse getCurrentRoles(@RequestHeader("Authorization") String bearer);
}
```

Resilience:
- Configure timeouts/retries/circuit breakers via Resilience4j.
- Prefer idempotent operations for retries.

Configuration snippets:

```yaml
feign:
  client:
    config:
      default:
        connect-timeout: 2000
        read-timeout: 3000

resilience4j:
  circuitbreaker:
    instances:
      authorizationClient:
        slidingWindowSize: 20
        failureRateThreshold: 50
  retry:
    instances:
      authorizationClient:
        maxAttempts: 3
        waitDuration: 200ms
```

