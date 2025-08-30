# Spring Cloud Microservices Architecture Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                             │
│                      (nginx/ALB)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  API Gateway                                    │
│              (Spring Cloud Gateway)                            │
│  • Rate Limiting    • Authentication Filter                   │
│  • Load Balancing   • Request/Response Transformation         │
│  • Circuit Breaker  • Audit Logging                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
              ┌───────┴───────┐
              │               │
┌─────────────▼─┐    ┌───────▼─────────────────┐
│ Service        │    │    Microservices        │
│ Discovery      │◄───┤  • Auth Service         │
│ (Eureka)       │    │  • Authorization Svc    │
│                │    │  • User Service         │
│                │    │  • Audit Service        │
│                │    │  • Notification Svc     │
└─────────────▲──┘    └─────────────────────────┘
              │                     │
┌─────────────┴──┐                 │
│ Config Server  │                 │
│ (Spring Cloud  │                 │
│  Config)       │                 │
└────────────────┘                 │
                                   │
┌──────────────────────────────────▼──┐
│           Data Layer                │
│  • PostgreSQL (Primary DB)          │
│  • Redis (Cache/Sessions)           │
│  • RabbitMQ (Async Messaging)       │
└─────────────────────────────────────┘
```

## Service Interaction Flow

### Authentication Flow
1. Client → API Gateway → Auth Service
2. Auth Service validates credentials → JWT Token
3. Gateway caches user roles → Routes to target service
4. Target service validates JWT → Business logic

### Authorization Flow
1. Gateway extracts JWT claims
2. Authorization Service evaluates permissions
3. Request allowed/denied based on RBAC rules

## Database Schema Design

### Auth Service Database
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Authorization Service Database
```sql
-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- User roles mapping
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- API resources for fine-grained access control
CREATE TABLE api_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(50) NOT NULL,
    endpoint_pattern VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    required_permission VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Service Database
```sql
-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id UUID,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    service_name VARCHAR(50),
    endpoint VARCHAR(255),
    http_method VARCHAR(10),
    request_ip INET,
    user_agent TEXT,
    request_payload JSONB,
    response_status INTEGER,
    response_payload JSONB,
    execution_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security events
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    description TEXT,
    metadata JSONB,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration Management

### Application Configuration Structure
```
config-repo/
├── application.yml                 # Global defaults
├── application-dev.yml             # Development environment
├── application-prod.yml            # Production environment
├── api-gateway.yml                 # Gateway-specific config
├── api-gateway-dev.yml
├── api-gateway-prod.yml
├── auth-service.yml                # Auth service config
├── auth-service-dev.yml
├── auth-service-prod.yml
├── authorization-service.yml
├── user-service.yml
├── audit-service.yml
└── notification-service.yml
```

### Key Configuration Properties
```yaml
# application.yml (Global)
spring:
  application:
    name: ${SERVICE_NAME:unknown-service}
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_SERVER_URL:http://localhost:8761/eureka}
    
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
      
logging:
  level:
    org.springframework.security: DEBUG
    com.company.auth: DEBUG
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{traceId},%X{spanId}] %logger{36} - %msg%n"
```

## Security Architecture

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "iss": "auth-service",
  "aud": ["api-gateway", "user-service"],
  "exp": 1640995200,
  "iat": 1640991600,
  "authorities": ["ROLE_USER", "ROLE_ADMIN"],
  "permissions": ["user:read", "user:write", "admin:manage"],
  "session_id": "session-uuid",
  "ip": "192.168.1.100"
}
```

### Role-Based Access Control Matrix
```
Role        | Permissions                   | Services Accessible
------------------------------------------------------------------------
GUEST       | public:read                   | Public endpoints only
USER        | user:read, user:update-self   | User service (own data)
ADMIN       | user:*, admin:*               | All user operations
SUPER_ADMIN | *:*                          | All services, all operations
SERVICE     | service:*                     | Inter-service communication
```

### Security Filters Chain
1. **CORS Filter** - Handle cross-origin requests
2. **Rate Limiting Filter** - Prevent abuse
3. **Authentication Filter** - JWT validation
4. **Authorization Filter** - Permission checking
5. **Audit Filter** - Log security events
6. **Circuit Breaker Filter** - Fault tolerance

## Monitoring and Observability

### Metrics Collection
- **Application Metrics**: Custom business metrics
- **JVM Metrics**: Memory, GC, threads
- **HTTP Metrics**: Request rate, response time, error rate
- **Database Metrics**: Connection pool, query performance
- **Cache Metrics**: Hit/miss ratio, eviction rate

### Distributed Tracing
- **Trace ID**: Unique identifier across all services
- **Span ID**: Individual service operation identifier
- **Baggage**: Context propagation for user info
- **Tags**: Service name, operation, user ID

### Health Checks
```yaml
# Health check endpoints
/actuator/health          # Overall health
/actuator/health/db       # Database connectivity
/actuator/health/redis    # Cache connectivity
/actuator/health/rabbit   # Message broker
/actuator/health/eureka   # Service discovery
```

## Fault Tolerance Patterns

### Circuit Breaker Configuration
```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        failureRateThreshold: 50
        waitDurationInOpenState: 30s
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
      
  retry:
    instances:
      userService:
        maxAttempts: 3
        waitDuration: 1s
        
  bulkhead:
    instances:
      userService:
        maxConcurrentCalls: 10
        maxWaitDuration: 1s
```

### Fallback Strategies
- **Circuit Breaker**: Return cached data or default response
- **Retry**: Automatic retry with exponential backoff
- **Timeout**: Fail fast after specified duration
- **Bulkhead**: Isolate critical resources

## API Design Standards

### REST API Conventions
```
GET    /api/v1/users              # List users
GET    /api/v1/users/{id}         # Get user by ID
POST   /api/v1/users              # Create user
PUT    /api/v1/users/{id}         # Update user (full)
PATCH  /api/v1/users/{id}         # Update user (partial)
DELETE /api/v1/users/{id}         # Delete user

# Nested resources
GET    /api/v1/users/{id}/roles   # Get user roles
POST   /api/v1/users/{id}/roles   # Assign role to user
DELETE /api/v1/users/{id}/roles/{roleId}  # Remove role
```

### Response Format Standards
```json
{
  "status": "success|error",
  "data": {...},
  "message": "Human readable message",
  "timestamp": "2023-01-01T00:00:00Z",
  "path": "/api/v1/users",
  "metadata": {
    "page": 1,
    "size": 20,
    "total": 100
  }
}
```

### Error Response Format (RFC 7807)
```json
{
  "type": "https://api.company.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid data",
  "instance": "/api/v1/users",
  "timestamp": "2023-01-01T00:00:00Z",
  "violations": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Testing Strategy

### Test Pyramid
1. **Unit Tests** (70%)
   - Service layer business logic
   - Utility functions
   - Data validation

2. **Integration Tests** (20%)
   - Database integration
   - External service integration
   - Security configuration

3. **End-to-End Tests** (10%)
   - Complete user journeys
   - Cross-service workflows
   - Performance testing

### Contract Testing
- **Consumer Contracts**: Frontend defines expected API behavior
- **Provider Contracts**: Service implements and validates contracts
- **Contract Evolution**: Backward compatibility validation

## Deployment Architecture

### Container Strategy
- **Base Image**: OpenJDK 21 Alpine
- **Multi-stage Builds**: Separate build and runtime
- **Security Scanning**: Trivy/Snyk integration
- **Image Signing**: Cosign for supply chain security

### Kubernetes Deployment
```yaml
# Service deployment pattern
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    spec:
      containers:
      - name: auth-service
        image: auth-service:latest
        ports:
        - containerPort: 8081
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8081
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
```

### Environment Promotion Pipeline
1. **Development**: Local Docker Compose
2. **Testing**: Kubernetes test cluster
3. **Staging**: Production-like environment
4. **Production**: Blue-green deployment

This architecture provides a solid foundation for a production-ready, scalable, and maintainable Spring Cloud microservices system with comprehensive security, monitoring, and operational capabilities.