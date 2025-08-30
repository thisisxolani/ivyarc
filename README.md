# Spring Cloud Native Auth Flow Microservices Architecture

## Overview
This workspace contains a production-ready Spring Cloud microservices architecture implementing authentication, authorization, and role-based API gateway functionality. The system is designed for scalability, fault tolerance, and easy integration of new microservices.

## Architecture Components

### Core Services
- **API Gateway** - Edge service with rate limiting and routing
- **Service Discovery** - Eureka server for dynamic service registration
- **Configuration Server** - Centralized configuration management
- **Authentication Service** - JWT/OAuth2 authentication
- **Authorization Service** - Role-based access control (RBAC)
- **User Management Service** - User CRUD operations
- **Audit Service** - Security and activity logging

### Infrastructure Services
- **Monitoring Service** - Metrics and health checks
- **Tracing Service** - Distributed tracing
- **Notification Service** - Email/SMS notifications

## Technology Stack
- **Spring Boot 3.2+**
- **Spring Cloud 2023.0.x**
- **Spring Security 6+**
- **Spring Data JPA/JDBC**
- **PostgreSQL** (primary database)
- **Redis** (caching and sessions)
- **RabbitMQ** (async messaging)
- **Prometheus** (metrics)
- **Zipkin** (tracing)
- **Docker** (containerization)

## Project Structure
```
spring-cloud-auth-workspace/
├── infrastructure/
│   ├── service-discovery/          # Eureka Server
│   ├── config-server/              # Spring Cloud Config
│   ├── api-gateway/                # Spring Cloud Gateway
│   └── monitoring/                 # Prometheus & Grafana setup
├── core-services/
│   ├── auth-service/               # Authentication Service
│   ├── authorization-service/      # RBAC Service
│   ├── user-service/               # User Management
│   └── audit-service/              # Audit & Logging
├── support-services/
│   ├── notification-service/       # Notifications
│   └── file-service/               # File management
├── shared/
│   ├── common-lib/                 # Shared utilities
│   ├── security-lib/               # Security components
│   └── dto-lib/                    # Data Transfer Objects
├── frontend/
│   ├── admin-dashboard/            # React Admin UI
│   ├── user-portal/                # User-facing UI
│   └── api-docs/                   # OpenAPI documentation
├── tests/
│   ├── integration-tests/          # Cross-service tests
│   ├── contract-tests/             # Pact consumer/provider
│   └── performance-tests/          # Load testing
├── deployment/
│   ├── docker-compose/             # Local development
│   ├── kubernetes/                 # K8s manifests
│   └── terraform/                  # Infrastructure as Code
└── docs/
    ├── api/                        # API documentation
    ├── architecture/               # Architecture diagrams
    └── deployment/                 # Deployment guides
```

## Getting Started
1. Run `./scripts/setup-local.sh` to start all services locally
2. Access API Gateway at `http://localhost:8080`
3. View service discovery at `http://localhost:8761`
4. Monitor metrics at `http://localhost:9090`

## Service Endpoints
- **API Gateway**: `:8080`
- **Eureka Server**: `:8761`
- **Config Server**: `:8888`
- **Auth Service**: `:8081`
- **Authorization Service**: `:8082`
- **User Service**: `:8083`
- **Audit Service**: `:8084`

## Security Model
- **JWT Tokens** for stateless authentication
- **Role-Based Access Control** with fine-grained permissions
- **OAuth2** integration for third-party authentication
- **Rate Limiting** per user/IP/endpoint
- **Audit Logging** for all security events

## API Versioning
All APIs follow the versioning pattern: `/api/v1/`, `/api/v2/`

## Documentation
- OpenAPI 3.0 specifications for all services
- Interactive API documentation available at `/swagger-ui`
- Architecture decision records in `/docs/architecture/`