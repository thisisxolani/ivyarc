#!/bin/bash
# =============================================================================
# IvyArc Spring Cloud Microservices - Local Development Setup Script
# =============================================================================
# This script sets up the complete local development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/data"
LOG_FILE="$PROJECT_ROOT/setup.log"

# Default environment variables
export COMPOSE_PROJECT_NAME="ivyarc"
export COMPOSE_FILE="$PROJECT_ROOT/docker-compose.infrastructure.yml"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists mvn; then
        print_warning "Maven is not installed. Services will need to be built manually."
    fi
    
    if ! command_exists java; then
        print_warning "Java is not installed. Services will need to be run in Docker."
    fi
    
    print_success "Prerequisites check completed."
}

# Function to create directories
create_directories() {
    print_status "Creating data directories..."
    
    mkdir -p "$DATA_DIR"/{postgres,redis,rabbitmq,prometheus,grafana}
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Set proper permissions
    chmod -R 755 "$DATA_DIR"
    chmod -R 755 "$PROJECT_ROOT/logs"
    
    print_success "Directories created successfully."
}

# Function to setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            print_success "Environment file created from template."
            print_warning "Please review and update $PROJECT_ROOT/.env with your specific configuration."
        else
            print_error "No .env.example file found. Creating basic .env file."
            cat > "$PROJECT_ROOT/.env" << EOF
# Basic IvyArc Configuration
DATA_DIR=./data
SPRING_PROFILES_ACTIVE=development
POSTGRES_PASSWORD=change_me_in_production
RABBITMQ_PASSWORD=change_me_in_production
GRAFANA_PASSWORD=change_me_in_production
JWT_SECRET=your_very_secure_jwt_secret_key_that_is_at_least_256_bits_long
EOF
        fi
    else
        print_success "Environment file already exists."
    fi
}

# Function to start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images
    print_status "Pulling Docker images..."
    docker-compose -f docker-compose.infrastructure.yml pull
    
    # Start services
    print_status "Starting services..."
    docker-compose -f docker-compose.infrastructure.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_service_health
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."
    
    local services=("postgres:5432" "redis:6379" "rabbitmq:5672" "prometheus:9090" "grafana:3001")
    local max_attempts=30
    local attempt=1
    
    for service in "${services[@]}"; do
        local host=$(echo $service | cut -d':' -f1)
        local port=$(echo $service | cut -d':' -f2)
        
        print_status "Checking $host:$port..."
        
        while [ $attempt -le $max_attempts ]; do
            if nc -z localhost $port 2>/dev/null; then
                print_success "$host is ready on port $port"
                break
            else
                if [ $attempt -eq $max_attempts ]; then
                    print_error "$host failed to start on port $port after $max_attempts attempts"
                    docker-compose -f docker-compose.infrastructure.yml logs $host
                    exit 1
                fi
                sleep 2
                attempt=$((attempt + 1))
            fi
        done
        attempt=1
    done
}

# Function to build Spring Boot services
build_services() {
    if command_exists mvn; then
        print_status "Building Spring Boot services..."
        
        local services=("infrastructure/service-discovery" "infrastructure/config-server" "infrastructure/api-gateway" "core-services/auth-service" "core-services/authorization-service")
        
        for service in "${services[@]}"; do
            if [ -d "$PROJECT_ROOT/$service" ]; then
                print_status "Building $service..."
                cd "$PROJECT_ROOT/$service"
                mvn clean compile -DskipTests=true
                if [ $? -eq 0 ]; then
                    print_success "$service built successfully"
                else
                    print_error "Failed to build $service"
                fi
            fi
        done
        
        cd "$PROJECT_ROOT"
    else
        print_warning "Maven not found. Skipping service builds."
    fi
}

# Function to display service information
display_service_info() {
    print_success "\n=== IvyArc Local Development Environment Ready ==="
    print_status "\nInfrastructure Services:"
    echo "  ┌─ PostgreSQL:     http://localhost:5432"
    echo "  ├─ Redis:          http://localhost:6379"
    echo "  ├─ RabbitMQ:       http://localhost:15672 (admin/admin123)"
    echo "  ├─ Prometheus:     http://localhost:9090"
    echo "  ├─ Grafana:        http://localhost:3001 (admin/admin123)"
    echo "  ├─ Zipkin:         http://localhost:9411"
    echo "  └─ MailDev:        http://localhost:1080"
    
    print_status "\nSpring Cloud Services (when running):"
    echo "  ┌─ Eureka Server:   http://localhost:8761"
    echo "  ├─ Config Server:   http://localhost:8888"
    echo "  ├─ API Gateway:     http://localhost:8080"
    echo "  ├─ Auth Service:    http://localhost:8081"
    echo "  ├─ Authorization:   http://localhost:8082"
    echo "  ├─ User Management: http://localhost:8083"
    echo "  └─ Audit Service:   http://localhost:8084"
    
    print_status "\nUseful Commands:"
    echo "  ┌─ View logs:        docker-compose -f docker-compose.infrastructure.yml logs -f [service]"
    echo "  ├─ Stop services:   docker-compose -f docker-compose.infrastructure.yml down"
    echo "  ├─ Restart service: docker-compose -f docker-compose.infrastructure.yml restart [service]"
    echo "  ├─ Build services:  mvn clean install (in each service directory)"
    echo "  ├─ Run service:     mvn spring-boot:run (in each service directory)"
    echo "  └─ View this info:  $0 --info"
    
    print_status "\nNext Steps:"
    echo "  1. Start Eureka Server: cd infrastructure/service-discovery && mvn spring-boot:run"
    echo "  2. Start Config Server: cd infrastructure/config-server && mvn spring-boot:run"
    echo "  3. Start API Gateway: cd infrastructure/api-gateway && mvn spring-boot:run"
    echo "  4. Start Core Services: cd core-services/[service] && mvn spring-boot:run"
    echo ""
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.infrastructure.yml down
    print_success "All services stopped."
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up environment..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.infrastructure.yml down -v
    docker system prune -f
    rm -rf "$DATA_DIR"
    rm -f "$LOG_FILE"
    print_success "Environment cleaned up."
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.infrastructure.yml ps
}

# Function to tail logs
tail_logs() {
    cd "$PROJECT_ROOT"
    if [ -n "$1" ]; then
        docker-compose -f docker-compose.infrastructure.yml logs -f "$1"
    else
        docker-compose -f docker-compose.infrastructure.yml logs -f
    fi
}

# Main execution
main() {
    case "${1:-setup}" in
        "setup")
            print_status "Starting IvyArc local development environment setup..."
            check_prerequisites
            create_directories
            setup_environment
            start_infrastructure
            build_services
            display_service_info
            ;;
        "start")
            start_infrastructure
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_infrastructure
            ;;
        "status")
            show_status
            ;;
        "logs")
            tail_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "info")
            display_service_info
            ;;
        "help"|"--help"|*)
            echo "IvyArc Local Development Setup"
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup     - Setup complete local development environment (default)"
            echo "  start     - Start infrastructure services"
            echo "  stop      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  status    - Show service status"
            echo "  logs      - Tail logs for all services or specific service"
            echo "  cleanup   - Clean up everything (removes data)"
            echo "  info      - Display service information"
            echo "  help      - Show this help message"
            ;;
    esac
}

# Execute main function
main "$@"