# Development Setup Guide

This guide will help you set up a complete development environment for the IvyArc Spring Cloud microservices system.

## 📋 Prerequisites

### Required Software
- **Java 21** - OpenJDK or Oracle JDK
- **Maven 3.9+** - Dependency management and build tool
- **Docker & Docker Compose** - Containerization and local services
- **Node.js 20+** - Frontend development
- **Git** - Version control
- **IDE** - IntelliJ IDEA (recommended) or VS Code

### System Requirements
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 12+, or Ubuntu 20.04+

## 🛠️ Environment Setup

### 1. Install Java 21

#### Using SDKMAN (Recommended for macOS/Linux)
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 21
sdk install java 21.0.1-tem
sdk use java 21.0.1-tem
```

#### Manual Installation
- **Windows**: Download from [Adoptium](https://adoptium.net/)
- **macOS**: `brew install openjdk@21`
- **Ubuntu**: `sudo apt install openjdk-21-jdk`

Verify installation:
```bash
java -version
# Should output Java 21.x.x
```

### 2. Install Maven

#### Using Package Managers
```bash
# macOS
brew install maven

# Ubuntu
sudo apt install maven

# Windows (using Chocolatey)
choco install maven
```

Verify installation:
```bash
mvn -version
# Should output Maven 3.9.x
```

### 3. Install Docker

Follow the official installation guides:
- **Windows/macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Ubuntu**: [Docker Engine](https://docs.docker.com/engine/install/ubuntu/)

Verify installation:
```bash
docker --version
docker-compose --version
```

### 4. Install Node.js

#### Using Node Version Manager (Recommended)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
```

Verify installation:
```bash
node --version
npm --version
```

## 📁 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ivyarc.git
cd ivyarc
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your local configuration:
```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ivyarc_dev
POSTGRES_USER=ivyarc_dev
POSTGRES_PASSWORD=dev_password_123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_dev_password

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=ivyarc_dev
RABBITMQ_PASSWORD=rabbit_dev_password

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-for-development-only-min-64-chars
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=2592000

# Service Discovery
EUREKA_SERVER_URL=http://localhost:8761/eureka

# Development Settings
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=DEBUG
```

### 3. Start Infrastructure Services

Start the required infrastructure services using Docker Compose:

```bash
# Start PostgreSQL, Redis, RabbitMQ, and monitoring services
docker-compose -f docker-compose.infrastructure.yml up -d

# Verify services are running
docker-compose -f docker-compose.infrastructure.yml ps
```

Expected services:
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379  
- **RabbitMQ**: Port 5672 (Web UI: 15672)
- **Prometheus**: Port 9090
- **Zipkin**: Port 9411

### 4. Initialize Databases

Run the database setup script:
```bash
./scripts/setup-databases.sh
```

This script will:
- Create development databases
- Run Flyway migrations
- Insert seed data
- Create test users

### 5. Build All Services

```bash
# Build all Maven projects
mvn clean install -DskipTests

# Or build individually
mvn clean install -pl infrastructure/service-discovery
mvn clean install -pl infrastructure/config-server
mvn clean install -pl infrastructure/api-gateway
mvn clean install -pl core-services/auth-service
mvn clean install -pl core-services/authorization-service
```

## 🚀 Starting Services

### Option 1: Using the Setup Script (Recommended)

```bash
# Start all services in the correct order
./scripts/setup-local.sh
```

This script will:
1. Start infrastructure services
2. Wait for services to be ready
3. Start Spring Boot services in dependency order
4. Display service status and URLs

### Option 2: Manual Service Startup

Start services in this order:

#### 1. Service Discovery (Eureka)
```bash
cd infrastructure/service-discovery
mvn spring-boot:run
```
Wait for startup, then verify at: http://localhost:8761

#### 2. Configuration Server
```bash
cd infrastructure/config-server
mvn spring-boot:run
```
Verify at: http://localhost:8888

#### 3. Core Services
```bash
# Terminal 1: Auth Service
cd core-services/auth-service
mvn spring-boot:run

# Terminal 2: Authorization Service  
cd core-services/authorization-service
mvn spring-boot:run

# Terminal 3: User Service
cd core-services/user-service
mvn spring-boot:run

# Terminal 4: Audit Service
cd core-services/audit-service  
mvn spring-boot:run
```

#### 4. API Gateway
```bash
cd infrastructure/api-gateway
mvn spring-boot:run
```

### Service Health Check

Verify all services are running:
```bash
# Check service discovery
curl http://localhost:8761/eureka/apps

# Check API Gateway health
curl http://localhost:8080/actuator/health

# Test authentication
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}'
```

## 🎨 Frontend Development

### 1. Setup Angular Frontend

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
# Start with hot reload
npm run dev

# Or using Angular CLI
ng serve
```

Frontend will be available at: http://localhost:4200

### 3. Build for Production

```bash
npm run build
```

## 🧪 Running Tests

### Unit Tests
```bash
# Run all unit tests
mvn test

# Run tests for specific service
mvn test -pl core-services/auth-service

# Run with coverage
mvn test jacoco:report
```

### Integration Tests
```bash
# Run integration tests (requires Docker)
mvn verify -Pintegration-tests

# Run specific integration test
mvn test -Dtest=AuthServiceIntegrationTest
```

### Frontend Tests
```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run e2e

# Test with coverage
npm run test:coverage
```

## 🐛 Development Tools

### IDE Configuration

#### IntelliJ IDEA Setup
1. Import the project as a Maven project
2. Install recommended plugins:
   - Spring Boot
   - Docker
   - Angular/TypeScript
3. Configure code style: `File > Settings > Editor > Code Style`
4. Import code style from `dev-tools/intellij-code-style.xml`

#### VS Code Setup
Install recommended extensions:
```bash
code --install-extension vscjava.vscode-java-pack
code --install-extension vscjava.vscode-spring-boot-dashboard
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension angular.ng-template
```

### Database Management

#### Access PostgreSQL
```bash
# Using psql
psql -h localhost -U ivyarc_dev -d ivyarc_dev

# Using Docker
docker exec -it ivyarc-postgres psql -U ivyarc_dev -d ivyarc_dev
```

#### Database GUI Tools
- **DBeaver** (Free): Universal database tool
- **pgAdmin** (PostgreSQL): Web-based PostgreSQL administration
- **DataGrip** (IntelliJ): Commercial database IDE

### Monitoring and Debugging

#### Service Monitoring
- **Eureka Dashboard**: http://localhost:8761
- **Prometheus Metrics**: http://localhost:9090
- **Zipkin Tracing**: http://localhost:9411
- **RabbitMQ Management**: http://localhost:15672

#### Log Monitoring
```bash
# View service logs
docker-compose logs -f api-gateway
docker-compose logs -f auth-service

# Follow specific service logs
tail -f infrastructure/api-gateway/logs/application.log
```

#### Debug Configuration

Add to your IDE run configuration:
```
-Dspring.profiles.active=dev
-Dlogging.level.com.company=DEBUG
-Djava.awt.headless=true
-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005
```

## 🔧 Common Development Tasks

### Adding a New Service

1. Create service structure:
```bash
mkdir -p core-services/new-service/src/main/java/com/company/newservice
mkdir -p core-services/new-service/src/test/java/com/company/newservice
```

2. Create `pom.xml` using existing service as template
3. Add service configuration to `application.yml`
4. Register service with Eureka
5. Update API Gateway routing
6. Add service to Docker Compose files

### Database Schema Changes

1. Create new Flyway migration:
```bash
# Create migration file
touch core-services/auth-service/src/main/resources/db/migration/V2__add_new_table.sql
```

2. Write SQL migration:
```sql
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Test migration:
```bash
mvn flyway:migrate -Dflyway.configFiles=flyway-dev.conf
```

### API Documentation Updates

1. Update OpenAPI annotations in controllers
2. Generate API docs:
```bash
mvn spring-boot:run -Dspring.profiles.active=dev
curl http://localhost:8081/v3/api-docs > docs/api/auth-service/openapi.json
```

3. Update documentation files in `docs/api/`

## ❗ Troubleshooting

### Common Issues

#### Services Not Starting
**Problem**: Services fail to start or connect

**Solutions**:
1. Check if all infrastructure services are running:
   ```bash
   docker-compose -f docker-compose.infrastructure.yml ps
   ```
2. Verify environment variables in `.env`
3. Check service logs for specific errors
4. Ensure correct Java version (21)

#### Database Connection Issues
**Problem**: Cannot connect to PostgreSQL

**Solutions**:
1. Verify PostgreSQL container is running
2. Check database credentials in `.env`
3. Test connection manually:
   ```bash
   psql -h localhost -p 5432 -U ivyarc_dev -d ivyarc_dev
   ```

#### Port Conflicts
**Problem**: Port already in use errors

**Solutions**:
1. Check which process is using the port:
   ```bash
   # macOS/Linux
   lsof -i :8080
   
   # Windows
   netstat -ano | findstr :8080
   ```
2. Kill the conflicting process or change port configuration
3. Update ports in `application.yml` and `.env`

#### Out of Memory Errors
**Problem**: Java heap space errors

**Solutions**:
1. Increase JVM memory:
   ```bash
   export MAVEN_OPTS="-Xmx2048m -Xms1024m"
   ```
2. Add to IDE VM options: `-Xmx2048m -Xms1024m`
3. Close unused services during development

### Getting Help

#### Development Resources
- **Spring Boot Documentation**: https://docs.spring.io/spring-boot/
- **Spring Cloud Documentation**: https://spring.io/projects/spring-cloud
- **Angular Documentation**: https://angular.io/docs

#### Team Communication
- **Slack Channel**: #ivyarc-development
- **Issue Tracking**: GitHub Issues
- **Code Review**: GitHub Pull Requests

#### Support
- **Internal Documentation**: Check `docs/` folder
- **Team Wiki**: Internal knowledge base
- **Ask Questions**: Don't hesitate to ask team members

---

**Next Steps**:
- [Coding Standards](./coding-standards.md)
- [Testing Guide](./testing-guide.md)
- [Deployment Guide](../operations/deployment.md)

**Navigation**: [← Technical Documentation](../README.md) | [Architecture](../architecture/) | [Operations](../operations/)