#!/bin/bash
# =============================================================================
# IvyArc Data Backup Script
# =============================================================================
# This script creates backups of PostgreSQL databases and Redis data

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Set default values
POSTGRES_USER=${POSTGRES_USER:-ivyarc_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-ivyarc_password}
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

# Function to backup PostgreSQL databases
backup_postgres() {
    print_status "Starting PostgreSQL backup..."
    
    local databases=("auth_db" "authorization_db" "user_management_db" "audit_db")
    
    for db in "${databases[@]}"; do
        print_status "Backing up database: $db"
        
        local backup_file="$BACKUP_DIR/postgres_${db}_${DATE}.sql"
        
        if docker exec ivyarc-postgres pg_dump -U "$POSTGRES_USER" -d "$db" > "$backup_file"; then
            # Compress the backup
            gzip "$backup_file"
            print_success "Database $db backed up successfully: ${backup_file}.gz"
        else
            print_error "Failed to backup database: $db"
        fi
    done
}

# Function to backup Redis data
backup_redis() {
    print_status "Starting Redis backup..."
    
    local backup_file="$BACKUP_DIR/redis_${DATE}.rdb"
    
    if docker exec ivyarc-redis redis-cli BGSAVE; then
        # Wait for background save to complete
        sleep 5
        
        # Copy the dump file
        if docker cp ivyarc-redis:/data/dump.rdb "$backup_file"; then
            # Compress the backup
            gzip "$backup_file"
            print_success "Redis data backed up successfully: ${backup_file}.gz"
        else
            print_error "Failed to copy Redis dump file"
        fi
    else
        print_error "Failed to create Redis backup"
    fi
}

# Function to backup RabbitMQ configuration
backup_rabbitmq() {
    print_status "Starting RabbitMQ configuration backup..."
    
    local backup_file="$BACKUP_DIR/rabbitmq_definitions_${DATE}.json"
    
    if docker exec ivyarc-rabbitmq rabbitmqctl export_definitions /tmp/definitions.json; then
        if docker cp ivyarc-rabbitmq:/tmp/definitions.json "$backup_file"; then
            # Compress the backup
            gzip "$backup_file"
            print_success "RabbitMQ configuration backed up successfully: ${backup_file}.gz"
        else
            print_error "Failed to copy RabbitMQ definitions file"
        fi
    else
        print_error "Failed to export RabbitMQ definitions"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local retention_days=${BACKUP_RETENTION_DAYS:-30}
    
    print_status "Cleaning up backups older than $retention_days days..."
    
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$retention_days -delete
    
    print_success "Old backups cleaned up"
}

# Function to create full backup
full_backup() {
    print_status "Starting full backup process..."
    
    backup_postgres
    backup_redis
    backup_rabbitmq
    cleanup_old_backups
    
    # Create backup manifest
    local manifest_file="$BACKUP_DIR/backup_manifest_${DATE}.txt"
    cat > "$manifest_file" << EOF
IvyArc Backup Manifest
Date: $(date)
Backup ID: $DATE

Files included in this backup:
$(ls -la $BACKUP_DIR/*${DATE}* 2>/dev/null || echo "No files created")

Environment:
PostgreSQL User: $POSTGRES_USER
PostgreSQL Host: $POSTGRES_HOST:$POSTGRES_PORT
Redis Host: $REDIS_HOST:$REDIS_PORT

Backup completed successfully!
EOF
    
    print_success "Full backup completed! Manifest: $manifest_file"
}

# Function to restore from backup
restore_backup() {
    local backup_date="$1"
    
    if [ -z "$backup_date" ]; then
        print_error "Please specify backup date (YYYYMMDD_HHMMSS)"
        echo "Available backups:"
        ls -la "$BACKUP_DIR" | grep -E "[0-9]{8}_[0-9]{6}"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_date"
    
    # Restore PostgreSQL databases
    local databases=("auth_db" "authorization_db" "user_management_db" "audit_db")
    
    for db in "${databases[@]}"; do
        local backup_file="$BACKUP_DIR/postgres_${db}_${backup_date}.sql.gz"
        
        if [ -f "$backup_file" ]; then
            print_status "Restoring database: $db"
            
            # Drop and recreate database
            docker exec ivyarc-postgres psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS ${db};"
            docker exec ivyarc-postgres psql -U "$POSTGRES_USER" -c "CREATE DATABASE ${db};"
            
            # Restore from backup
            zcat "$backup_file" | docker exec -i ivyarc-postgres psql -U "$POSTGRES_USER" -d "$db"
            
            print_success "Database $db restored successfully"
        else
            print_error "Backup file not found: $backup_file"
        fi
    done
    
    # Restore Redis data
    local redis_backup="$BACKUP_DIR/redis_${backup_date}.rdb.gz"
    
    if [ -f "$redis_backup" ]; then
        print_status "Restoring Redis data"
        
        # Stop Redis, restore data, start Redis
        docker stop ivyarc-redis
        zcat "$redis_backup" > "$PROJECT_ROOT/data/redis/dump.rdb"
        docker start ivyarc-redis
        
        print_success "Redis data restored successfully"
    else
        print_error "Redis backup file not found: $redis_backup"
    fi
}

# Main execution
case "${1:-full}" in
    "full")
        full_backup
        ;;
    "postgres")
        backup_postgres
        ;;
    "redis")
        backup_redis
        ;;
    "rabbitmq")
        backup_rabbitmq
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "list")
        print_status "Available backups:"
        ls -la "$BACKUP_DIR" | grep -E "[0-9]{8}_[0-9]{6}"
        ;;
    "help")
        echo "IvyArc Backup Script"
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  full        - Create full backup (default)"
        echo "  postgres    - Backup PostgreSQL databases only"
        echo "  redis       - Backup Redis data only"
        echo "  rabbitmq    - Backup RabbitMQ configuration only"
        echo "  restore     - Restore from backup (requires date)"
        echo "  list        - List available backups"
        echo "  help        - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 full"
        echo "  $0 restore 20231201_143000"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac