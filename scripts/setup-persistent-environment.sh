#!/bin/bash

# Setup Persistent Environment for IvyArc Spring Cloud
# This script sets up all required persistent data stores and ensures they survive restarts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-ivyarc_secure_password_$(openssl rand -hex 8)}"
REDIS_PASSWORD="${REDIS_PASSWORD:-redis_secure_password_$(openssl rand -hex 8)}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-rabbitmq_secure_password_$(openssl rand -hex 8)}"
PGADMIN_PASSWORD="${PGADMIN_PASSWORD:-admin_secure_password_$(openssl rand -hex 8)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Create data directories
create_data_directories() {
    log "Creating data directories..."
    
    mkdir -p "${PROJECT_ROOT}/data/postgres"
    mkdir -p "${PROJECT_ROOT}/data/redis" 
    mkdir -p "${PROJECT_ROOT}/data/rabbitmq"
    mkdir -p "${PROJECT_ROOT}/backup"
    mkdir -p "${PROJECT_ROOT}/logs"
    
    # Set proper permissions
    chmod 700 "${PROJECT_ROOT}/data/postgres"
    chmod 755 "${PROJECT_ROOT}/data/redis"
    chmod 755 "${PROJECT_ROOT}/data/rabbitmq"
    
    log_success "Data directories created"
}

# Create environment file
create_env_file() {
    log "Creating environment configuration..."
    
    cat > "${PROJECT_ROOT}/.env" << EOF
# IvyArc Environment Configuration
# Generated on $(date)

# Database Configuration
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_USERNAME=ivyarc_user
DATABASE_PASSWORD=${POSTGRES_PASSWORD}

# Service-specific database users
AUTH_SERVICE_DB_PASSWORD=auth_service_secure_password
AUTHORIZATION_SERVICE_DB_PASSWORD=authorization_service_secure_password
USER_SERVICE_DB_PASSWORD=user_service_secure_password
AUDIT_SERVICE_DB_PASSWORD=audit_service_secure_password

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_USER=rabbitmq_user
RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD}
RABBITMQ_VHOST=ivyarc
RABBITMQ_ERLANG_COOKIE=unique_erlang_cookie_$(openssl rand -hex 16)

# Admin Tools
PGADMIN_PASSWORD=${PGLADMIN_PASSWORD}

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_ISSUER=ivyarc-auth-service
JWT_AUDIENCE=ivyarc-services

# Spring Profiles
SPRING_PROFILES_ACTIVE=production

# Service Ports
EUREKA_SERVER_PORT=8761
CONFIG_SERVER_PORT=8888
API_GATEWAY_PORT=8080
AUTH_SERVICE_PORT=8081
AUTHORIZATION_SERVICE_PORT=8082
USER_SERVICE_PORT=8083
AUDIT_SERVICE_PORT=8084

# Monitoring
ZIPKIN_URL=http://localhost:9411/api/v2/spans
TRACING_SAMPLING_PROBABILITY=0.1

# Rate Limiting
RATE_LIMITING_ENABLED=true
LOGIN_RATE_LIMIT=5
API_RATE_LIMIT=100

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
EOF
    
    chmod 600 "${PROJECT_ROOT}/.env"
    log_success "Environment file created"
}

# Start persistence services
start_persistence_services() {
    log "Starting persistent data stores..."
    
    cd "${PROJECT_ROOT}"
    
    # Start infrastructure services
    docker-compose -f docker-compose.persistence.yml up -d
    
    log "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    local postgres_ready=false
    for i in {1..30}; do
        if docker exec ivyarc-postgres pg_isready -U ivyarc_user -d ivyarc_db > /dev/null 2>&1; then
            postgres_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$postgres_ready" = true ]; then
        log_success "PostgreSQL is ready"
    else
        log_error "PostgreSQL failed to start properly"
        return 1
    fi
    
    # Wait for Redis
    local redis_ready=false
    for i in {1..15}; do
        if docker exec ivyarc-redis redis-cli ping > /dev/null 2>&1; then
            redis_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$redis_ready" = true ]; then
        log_success "Redis is ready"
    else
        log_error "Redis failed to start properly"
        return 1
    fi
    
    # Wait for RabbitMQ
    local rabbitmq_ready=false
    for i in {1..30}; do
        if docker exec ivyarc-rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; then
            rabbitmq_ready=true
            break
        fi
        sleep 3
    done
    
    if [ "$rabbitmq_ready" = true ]; then
        log_success "RabbitMQ is ready"
    else
        log_error "RabbitMQ failed to start properly"
        return 1
    fi
    
    log_success "All persistence services are running and healthy"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Auth Service migrations
    cd "${PROJECT_ROOT}/core-services/auth-service"
    if [ -f "pom.xml" ]; then
        mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/auth_service_db \
                          -Dflyway.user=auth_service_user \
                          -Dflyway.password=auth_service_secure_password
        log_success "Auth service migrations completed"
    fi
    
    # Authorization Service migrations  
    cd "${PROJECT_ROOT}/core-services/authorization-service"
    if [ -f "pom.xml" ]; then
        mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/authorization_service_db \
                          -Dflyway.user=authorization_service_user \
                          -Dflyway.password=authorization_service_secure_password
        log_success "Authorization service migrations completed"
    fi
    
    cd "${PROJECT_ROOT}"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > "${PROJECT_ROOT}/scripts/backup-databases.sh" << 'EOF'
#!/bin/bash

# Database Backup Script for IvyArc
set -e

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Load environment variables
if [ -f "$(dirname "$0")/../.env" ]; then
    source "$(dirname "$0")/../.env"
fi

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Backup PostgreSQL databases
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    # Create backup directory
    mkdir -p "${BACKUP_DIR}/postgres"
    
    # Backup each database
    for db in auth_service_db authorization_service_db user_service_db audit_service_db; do
        log "Backing up database: $db"
        docker exec ivyarc-postgres pg_dump -U ivyarc_user -h localhost "$db" | \
            gzip > "${BACKUP_DIR}/postgres/${db}_${DATE}.sql.gz"
    done
    
    log "PostgreSQL backup completed"
}

# Backup Redis data
backup_redis() {
    log "Starting Redis backup..."
    
    mkdir -p "${BACKUP_DIR}/redis"
    docker exec ivyarc-redis redis-cli BGSAVE
    
    # Wait for background save to complete
    while [ "$(docker exec ivyarc-redis redis-cli LASTSAVE)" = "$(docker exec ivyarc-redis redis-cli LASTSAVE)" ]; do
        sleep 1
    done
    
    # Copy the dump file
    docker cp ivyarc-redis:/data/dump.rdb "${BACKUP_DIR}/redis/dump_${DATE}.rdb"
    
    log "Redis backup completed"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
    
    find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "*.rdb" -mtime +${RETENTION_DAYS} -delete
    
    log "Old backups cleaned up"
}

# Main backup process
main() {
    log "Starting backup process..."
    
    backup_postgres
    backup_redis
    cleanup_old_backups
    
    log "Backup process completed successfully"
}

main "$@"
EOF
    
    chmod +x "${PROJECT_ROOT}/scripts/backup-databases.sh"
    log_success "Backup script created"
}

# Display connection information
display_info() {
    log_success "IvyArc Persistent Environment Setup Complete!"
    echo
    echo "🗄️  Database Access:"
    echo "   PostgreSQL: localhost:5432"
    echo "   - Main DB: ivyarc_db"
    echo "   - Auth Service: auth_service_db" 
    echo "   - Authorization Service: authorization_service_db"
    echo "   - User Service: user_service_db"
    echo "   - Audit Service: audit_service_db"
    echo
    echo "🔴 Redis Cache: localhost:6379"
    echo "🐰 RabbitMQ: localhost:5672 (Management: localhost:15672)"
    echo
    echo "🛠️  Administration Tools:"
    echo "   - PgAdmin: http://localhost:5050"
    echo "   - Redis Commander: http://localhost:8081"
    echo "   - RabbitMQ Management: http://localhost:15672"
    echo
    echo "📁 Data Persistence:"
    echo "   - PostgreSQL data: ${PROJECT_ROOT}/data/postgres"
    echo "   - Redis data: ${PROJECT_ROOT}/data/redis"
    echo "   - RabbitMQ data: ${PROJECT_ROOT}/data/rabbitmq"
    echo "   - Backups: ${PROJECT_ROOT}/backup"
    echo
    echo "🔐 Credentials stored in: ${PROJECT_ROOT}/.env"
    echo
    echo "To start your Spring services:"
    echo "   1. Source the environment: source .env"
    echo "   2. Set profile: export SPRING_PROFILES_ACTIVE=production"
    echo "   3. Start services: ./scripts/start-services.sh"
    echo
    echo "To backup databases: ./scripts/backup-databases.sh"
}

# Main execution
main() {
    log "Starting IvyArc Persistent Environment Setup..."
    
    check_docker
    create_data_directories
    create_env_file
    start_persistence_services
    run_migrations
    create_backup_script
    display_info
    
    log_success "Setup completed successfully!"
}

# Run main function
main "$@"