# IvyArc Infrastructure Setup Guide

This document provides comprehensive guidance for setting up and managing the IvyArc Spring Cloud microservices infrastructure.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Components](#infrastructure-components)
- [Configuration](#configuration)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Monitoring and Observability](#monitoring-and-observability)
- [Backup and Recovery](#backup-and-recovery)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## 🔧 Prerequisites

Ensure the following tools are installed on your system:

- **Docker** (20.10.0+)
- **Docker Compose** (2.0.0+)
- **Java** (21+) for local development
- **Maven** (3.9.0+) for building services
- **Git** for version control
- **curl/wget** for health checks

### System Requirements

**Minimum for Development:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 20GB free space

**Recommended for Production:**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 100GB+ (SSD recommended)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ivyarc

# Copy and configure environment
cp .env.example .env
vim .env  # Update passwords and secrets

# Make scripts executable
chmod +x scripts/*.sh
```

### 2. Start Infrastructure

```bash
# Full automated setup
./scripts/setup-local.sh

# Or manual setup
docker-compose -f docker-compose.infrastructure.yml up -d
```

### 3. Verify Services

```bash
# Check service status
docker-compose -f docker-compose.infrastructure.yml ps

# View service logs
docker-compose -f docker-compose.infrastructure.yml logs -f
```

## 🏗️ Infrastructure Components

### Core Data Stores

| Service | Port | Purpose | Health Check |
|---------|------|---------|-------------|
| PostgreSQL | 5432 | Primary database | `pg_isready` |
| Redis | 6379 | Cache & sessions | `redis-cli ping` |
| RabbitMQ | 5672/15672 | Message broker | `rabbitmq-diagnostics ping` |

### Monitoring Stack

| Service | Port | Purpose | Access URL |
|---------|------|---------|------------|
| Prometheus | 9090 | Metrics collection | http://localhost:9090 |
| Grafana | 3001 | Dashboards | http://localhost:3001 |
| Zipkin | 9411 | Distributed tracing | http://localhost:9411 |

### Development Tools

| Service | Port | Purpose | Access URL |
|---------|------|---------|------------|
| MailDev | 1080/1025 | Email testing | http://localhost:1080 |
| Adminer | 8090 | Database admin | http://localhost:8090 |

## ⚙️ Configuration

### Environment Variables

Key configuration files:
- `.env` - Main environment configuration
- `.env.example` - Template with all options
- `docker-compose.*.yml` - Service definitions

### Database Configuration

```bash
# PostgreSQL Settings
POSTGRES_DB=ivyarc_main
POSTGRES_USER=ivyarc_user
POSTGRES_PASSWORD=your_secure_password

# Individual service databases are created automatically:
# - auth_db (Authentication Service)
# - authorization_db (Authorization Service)
# - user_management_db (User Management Service)
# - audit_db (Audit Service)
```

### Redis Configuration

```bash
# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional in development
REDIS_MAX_MEMORY=256mb
REDIS_MAX_MEMORY_POLICY=allkeys-lru
```

### RabbitMQ Configuration

```bash
# RabbitMQ Settings
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin123
RABBITMQ_VHOST=ivyarc
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
```

## 💻 Development Setup

### 1. Start Infrastructure Only

```bash
# Start only data stores and monitoring
docker-compose -f docker-compose.infrastructure.yml up -d
```

### 2. Build and Run Services Locally

```bash
# Build all services
find . -name "pom.xml" -exec mvn -f {} clean compile \;

# Start services in order:
# 1. Service Discovery
cd infrastructure/service-discovery
mvn spring-boot:run &

# 2. Configuration Server
cd ../config-server
mvn spring-boot:run &

# 3. API Gateway
cd ../api-gateway
mvn spring-boot:run &

# 4. Core Services
cd ../../core-services/auth-service
mvn spring-boot:run &

cd ../authorization-service
mvn spring-boot:run &
```

### 3. Development Profiles

Services automatically use the `development` profile which includes:
- H2 in-memory database for testing
- Detailed logging
- Hot reload capabilities
- Development-friendly security settings

## 🏭 Production Deployment

### 1. Production Environment Setup

```bash
# Copy production environment template
cp .env.example .env.production

# Update critical production settings
vim .env.production
```

### 2. Production Deployment

```bash
# Deploy with production overrides
docker-compose \
  -f docker-compose.infrastructure.yml \
  -f docker-compose.production.yml \
  --env-file .env.production \
  up -d
```

### 3. Production Security Checklist

- [ ] Change all default passwords
- [ ] Configure TLS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Review and update security groups
- [ ] Configure log rotation
- [ ] Set up external secret management

### 4. Scaling Configuration

```yaml
# docker-compose.production.yml scaling example
services:
  auth-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

## 📊 Monitoring and Observability

### Prometheus Metrics

- **Application Metrics**: Custom business metrics
- **JVM Metrics**: Heap, GC, threads
- **Spring Boot Metrics**: HTTP requests, database connections
- **Infrastructure Metrics**: PostgreSQL, Redis, RabbitMQ

### Grafana Dashboards

Pre-configured dashboards for:
- Service health overview
- Infrastructure monitoring
- Business metrics
- Security metrics
- Performance metrics

### Distributed Tracing

Zipkin integration provides:
- Request flow visualization
- Performance bottleneck identification
- Service dependency mapping
- Error tracking across services

### Log Aggregation

Centralized logging with:
- Structured JSON logs
- Correlation IDs
- Security event logs
- Performance logs

## 💾 Backup and Recovery

### Automated Backups

```bash
# Full backup (databases + configurations)
./scripts/backup-data.sh full

# Individual component backups
./scripts/backup-data.sh postgres
./scripts/backup-data.sh redis
./scripts/backup-data.sh rabbitmq
```

### Backup Schedule

```bash
# Add to crontab for automated backups
0 2 * * * /path/to/ivyarc/scripts/backup-data.sh full
```

### Recovery Procedures

```bash
# List available backups
./scripts/backup-data.sh list

# Restore from specific backup
./scripts/backup-data.sh restore 20231201_020000
```

### Backup Retention

- **Daily backups**: Retained for 30 days
- **Weekly backups**: Retained for 3 months
- **Monthly backups**: Retained for 1 year

## 🔒 Security Configuration

### Network Security

- Services communicate within isolated Docker network
- External access only through API Gateway
- Database access restricted to application services

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing with BCrypt

### Data Protection

- Database encryption at rest
- TLS encryption in transit
- Secret management with environment variables
- Audit logging for security events

### Production Security Hardening

```bash
# Disable unnecessary services
docker-compose -f docker-compose.production.yml \
  --profile production up -d

# Configure firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw deny 5432/tcp  # Block direct database access
ufw enable
```

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check available resources
docker system df
docker system prune -f

# Check service logs
docker-compose logs [service-name]
```

#### Database Connection Issues

```bash
# Test database connectivity
docker exec ivyarc-postgres pg_isready -U ivyarc_user

# Check database logs
docker logs ivyarc-postgres

# Connect to database manually
docker exec -it ivyarc-postgres psql -U ivyarc_user -d auth_db
```

#### Memory Issues

```bash
# Check memory usage
docker stats

# Adjust memory limits in docker-compose files
# Restart services with:
docker-compose restart
```

### Health Checks

```bash
# Infrastructure health check
./scripts/setup-local.sh status

# Individual service health
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3001/api/health # Grafana
curl http://localhost:9411/health     # Zipkin
```

### Log Analysis

```bash
# View aggregated logs
docker-compose logs -f --tail=100

# Service-specific logs
docker logs ivyarc-postgres -f
docker logs ivyarc-redis -f
docker logs ivyarc-rabbitmq -f

# Search logs
docker logs ivyarc-auth-service 2>&1 | grep ERROR
```

## 🛠️ Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor service health
- Check error logs
- Verify backup completion

#### Weekly
- Review performance metrics
- Clean up old Docker images
- Update dependencies

#### Monthly
- Security updates
- Capacity planning review
- Disaster recovery testing

### System Updates

```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Clean up unused resources
docker system prune -f
docker volume prune -f
```

### Performance Tuning

#### PostgreSQL Tuning

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Analyze table statistics
ANALYZE;
```

#### Redis Tuning

```bash
# Monitor Redis performance
docker exec ivyarc-redis redis-cli info stats
docker exec ivyarc-redis redis-cli slowlog get 10
```

#### RabbitMQ Tuning

```bash
# Check queue depths
docker exec ivyarc-rabbitmq rabbitmqctl list_queues

# Monitor memory usage
docker exec ivyarc-rabbitmq rabbitmqctl status
```

### Capacity Planning

#### Metrics to Monitor

- **CPU Usage**: Target < 70%
- **Memory Usage**: Target < 80%
- **Disk Usage**: Target < 85%
- **Database Connections**: Monitor pool usage
- **Queue Depths**: Should remain low

#### Scaling Triggers

- Response time > 2 seconds
- Error rate > 1%
- CPU usage > 80% for 15+ minutes
- Memory usage > 90%

### Service Discovery

Eureka dashboard: http://localhost:8761

### API Documentation

Swagger UI endpoints:
- Auth Service: http://localhost:8081/swagger-ui.html
- Authorization Service: http://localhost:8082/swagger-ui.html
- User Management: http://localhost:8083/swagger-ui.html
- Audit Service: http://localhost:8084/swagger-ui.html

## 📞 Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review service logs
3. Check monitoring dashboards
4. Consult the Spring Cloud documentation
5. Create an issue in the project repository

## 📚 Additional Resources

- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)