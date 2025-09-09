# System Architecture Overview

## 🏗️ High-Level Architecture

IvyArc implements a modern microservices architecture using Spring Cloud components for service discovery, configuration management, and distributed tracing.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer (nginx)                      │
│                      ivyarc.pro:443                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS/TLS 1.3
┌─────────────────────▼───────────────────────────────────────────┐
│                  API Gateway                                    │
│              Spring Cloud Gateway                              │
│  • JWT Authentication    • Rate Limiting (Redis)             │
│  • Load Balancing        • Request/Response Transformation   │
│  • Circuit Breaker       • CORS & Security Headers          │
│  • Distributed Tracing   • API Versioning                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Internal Network
              ┌───────┼───────┐
              │       │       │
┌─────────────▼─┐    ┌▼───────▼─────────────────┐
│ Service        │    │    Core Microservices    │
│ Discovery      │◄───┤  • Auth Service :8081    │
│ (Eureka)       │    │  • Authorization :8082   │
│ :8761          │    │  • User Service :8083    │
│                │    │  • Audit Service :8084   │
│                │    │  • Notification :8085    │
└─────────────▲──┘    └─────────────────────────┘
              │                     │
┌─────────────┴──┐                 │
│ Config Server  │                 │
│ (Spring Cloud  │                 │
│  Config) :8888 │                 │
└────────────────┘                 │
                                   │
┌──────────────────────────────────▼──┐
│           Infrastructure             │
│  • PostgreSQL :5432 (Primary DB)    │
│  • Redis :6379 (Cache/Sessions)     │
│  • RabbitMQ :5672 (Async Messaging) │
│  • Prometheus :9090 (Metrics)       │
│  • Zipkin :9411 (Distributed Trace) │
└─────────────────────────────────────┘
```

## 🔧 Core Services

### API Gateway (Port 8080)
**Technology**: Spring Cloud Gateway
**Responsibilities**:
- Request routing and load balancing
- JWT token validation and user authentication
- Rate limiting per user/IP/endpoint
- Circuit breaker patterns for fault tolerance
- CORS handling and security headers
- Request/response transformation and logging

**Key Features**:
- WebFlux-based reactive architecture
- Redis-backed rate limiting
- Circuit breaker with Resilience4j
- Distributed tracing integration
- Custom authentication filters

### Service Discovery (Port 8761)
**Technology**: Netflix Eureka Server
**Responsibilities**:
- Service registration and health checking
- Dynamic service discovery
- Load balancing target resolution
- Service metadata management

**Key Features**:
- Self-healing service registry
- Health check integration
- Zone-aware load balancing
- REST API for service queries

### Configuration Server (Port 8888)
**Technology**: Spring Cloud Config
**Responsibilities**:
- Centralized configuration management
- Environment-specific property management
- Dynamic configuration refresh
- Git-backed configuration repository

**Key Features**:
- Git repository integration
- Encryption/decryption support
- Profile-based configuration
- Refresh endpoints for runtime updates

## 🏢 Business Services

### Authentication Service (Port 8081)
**Purpose**: User authentication and JWT token management
**Key Operations**:
- User login/logout
- JWT token generation and validation
- Password reset and management
- Multi-factor authentication support

**Database**: PostgreSQL with user credentials, sessions, and security tokens

### Authorization Service (Port 8082)
**Purpose**: Role-based access control (RBAC)
**Key Operations**:
- Permission evaluation
- Role assignment and management
- Resource-based authorization
- API endpoint protection

**Database**: PostgreSQL with roles, permissions, and user-role mappings

### User Management Service (Port 8083)
**Purpose**: User lifecycle and profile management
**Key Operations**:
- User registration and verification
- Profile management
- User search and administration
- Account status management

**Database**: PostgreSQL with user profiles and metadata

### Audit Service (Port 8084)
**Purpose**: Security event logging and compliance
**Key Operations**:
- Authentication event logging
- API access logging
- Security event correlation
- Compliance reporting

**Database**: PostgreSQL with audit logs and security events

## 🔄 Service Communication Patterns

### Synchronous Communication
- **HTTP/REST**: Primary communication protocol
- **OpenFeign**: Declarative HTTP client with load balancing
- **Circuit Breakers**: Fault tolerance using Resilience4j
- **Timeouts**: Configured per service with sensible defaults

### Asynchronous Communication
- **RabbitMQ**: Event-driven messaging for non-critical operations
- **Event Publishing**: User registration, password changes, security events
- **Dead Letter Queues**: Failed message handling and retry logic

### Caching Strategy
- **Redis**: Distributed caching for session data and permissions
- **Spring Cache**: Method-level caching with TTL configuration
- **Cache Aside Pattern**: Application-managed cache updates

## 🗄️ Data Architecture

### Database Design
- **PostgreSQL**: Primary ACID-compliant database
- **Schema per Service**: Database isolation for microservices
- **Flyway Migrations**: Version-controlled schema changes
- **Connection Pooling**: HikariCP for optimal performance

### Data Consistency
- **Eventual Consistency**: For non-critical cross-service data
- **SAGA Pattern**: For distributed transactions
- **Event Sourcing**: For audit trail requirements

## 🔐 Security Architecture

### Authentication Flow
1. Client submits credentials to API Gateway
2. Gateway forwards to Authentication Service
3. Authentication Service validates and issues JWT
4. JWT contains user roles and permissions
5. Gateway caches user context for performance

### Authorization Flow
1. Gateway extracts JWT claims
2. Authorization Service evaluates permissions
3. Request allowed/denied based on RBAC rules
4. Audit Service logs security events

### Security Features
- **JWT Tokens**: Stateless authentication with RS256 signing
- **RBAC**: Fine-grained role-based access control
- **Rate Limiting**: Protection against abuse and DoS
- **Audit Logging**: Complete security event trail
- **HTTPS Only**: TLS 1.3 with strong cipher suites

## 📊 Monitoring and Observability

### Metrics Collection
- **Micrometer**: Application metrics collection
- **Prometheus**: Time-series metrics storage
- **Grafana**: Metrics visualization and alerting
- **Custom Metrics**: Business-specific KPIs

### Distributed Tracing
- **Spring Cloud Sleuth**: Automatic trace generation
- **Zipkin**: Trace collection and visualization
- **Trace Context**: Correlation across service boundaries

### Health Monitoring
- **Spring Boot Actuator**: Health checks and metrics
- **Database Health**: Connection and query health
- **External Service Health**: Redis, RabbitMQ status
- **Custom Health Indicators**: Business logic health

### Logging Strategy
- **Structured Logging**: JSON format for log aggregation
- **Correlation IDs**: Request tracking across services
- **Log Levels**: Environment-appropriate logging
- **Centralized Logging**: ELK stack for log aggregation

## 🚀 Deployment Architecture

### Container Strategy
- **Docker**: Containerized service deployment
- **Multi-stage Builds**: Optimized image sizes
- **Alpine Linux**: Minimal base images for security
- **Health Checks**: Container-level health monitoring

### Orchestration
- **Docker Compose**: Local development environment
- **Kubernetes**: Production orchestration (planned)
- **Load Balancing**: nginx for external load balancing
- **Service Mesh**: Istio integration (planned)

### Environment Strategy
- **Development**: Docker Compose with local services
- **Staging**: Production-like Kubernetes environment
- **Production**: High-availability Kubernetes cluster
- **Blue-Green Deployment**: Zero-downtime deployments

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services designed for horizontal scaling
- **Load Balancing**: Multiple instances with round-robin distribution
- **Auto-scaling**: CPU and memory-based scaling triggers
- **Database Scaling**: Read replicas for query performance

### Performance Optimization
- **Connection Pooling**: Optimized database connections
- **Caching**: Multi-level caching strategy
- **Async Processing**: Non-blocking operations where possible
- **Resource Limits**: Configured memory and CPU limits

### Resilience Patterns
- **Circuit Breaker**: Prevent cascade failures
- **Retry Logic**: Automatic retry with exponential backoff
- **Bulkhead**: Resource isolation for critical operations
- **Timeout Handling**: Fail-fast with configured timeouts

---

**Next Steps**: 
- [Service Interactions](./service-interactions.md)
- [Database Schema](./database-schema.md)
- [Security Model](./security-model.md)

**Navigation**: [← Documentation Home](../../README.md) | [Technical Docs](../README.md) | [API Reference](../../api/)