#!/bin/bash

# IvyArc.pro Nginx Management Script
# Provides common nginx management operations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CONFIG_FILE="/etc/nginx/sites-available/ivyarc.pro"
LOG_ACCESS="/var/log/nginx/ivyarc.pro.access.log"
LOG_ERROR="/var/log/nginx/ivyarc.pro.error.log"

show_usage() {
    echo -e "${BLUE}IvyArc.pro Nginx Management Script${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo
    echo "Usage: $0 {status|test|reload|restart|logs|backup|restore|help}"
    echo
    echo "Commands:"
    echo "  status    - Show nginx service status and basic info"
    echo "  test      - Test nginx configuration"
    echo "  reload    - Reload nginx configuration (zero downtime)"
    echo "  restart   - Restart nginx service"
    echo "  logs      - Show recent logs (access and error)"
    echo "  backup    - Backup current configuration"
    echo "  restore   - List and restore from backups"
    echo "  help      - Show this help message"
    echo
}

show_status() {
    echo -e "${YELLOW}Nginx Service Status:${NC}"
    systemctl status nginx --no-pager -l
    echo
    
    echo -e "${YELLOW}Configuration Test:${NC}"
    if nginx -t; then
        echo -e "${GREEN}✓ Configuration is valid${NC}"
    else
        echo -e "${RED}✗ Configuration has errors${NC}"
        return 1
    fi
    echo
    
    echo -e "${YELLOW}Active Sites:${NC}"
    ls -la /etc/nginx/sites-enabled/
    echo
    
    echo -e "${YELLOW}Recent Access (last 10 requests):${NC}"
    if [[ -f "$LOG_ACCESS" ]]; then
        tail -n 10 "$LOG_ACCESS"
    else
        echo "Access log not found"
    fi
    echo
}

test_config() {
    echo -e "${YELLOW}Testing nginx configuration...${NC}"
    if nginx -t; then
        echo -e "${GREEN}✓ Configuration test passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Configuration test failed${NC}"
        return 1
    fi
}

reload_nginx() {
    echo -e "${YELLOW}Testing configuration before reload...${NC}"
    if nginx -t; then
        echo -e "${GREEN}✓ Configuration valid, reloading...${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}✗ Configuration invalid, reload aborted${NC}"
        return 1
    fi
}

restart_nginx() {
    echo -e "${YELLOW}Testing configuration before restart...${NC}"
    if nginx -t; then
        echo -e "${GREEN}✓ Configuration valid, restarting...${NC}"
        systemctl restart nginx
        echo -e "${GREEN}✓ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}✗ Configuration invalid, restart aborted${NC}"
        return 1
    fi
}

show_logs() {
    echo -e "${YELLOW}Recent Access Log (last 20 entries):${NC}"
    if [[ -f "$LOG_ACCESS" ]]; then
        tail -n 20 "$LOG_ACCESS"
    else
        echo "Access log not found at $LOG_ACCESS"
    fi
    echo
    
    echo -e "${YELLOW}Recent Error Log (last 20 entries):${NC}"
    if [[ -f "$LOG_ERROR" ]]; then
        tail -n 20 "$LOG_ERROR"
    else
        echo "Error log not found at $LOG_ERROR"
    fi
    echo
    
    echo -e "${BLUE}To follow logs in real-time, use:${NC}"
    echo "  tail -f $LOG_ACCESS"
    echo "  tail -f $LOG_ERROR"
}

backup_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo -e "${RED}✗ Configuration file not found: $CONFIG_FILE${NC}"
        return 1
    fi
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${CONFIG_FILE}.backup.$TIMESTAMP"
    
    echo -e "${YELLOW}Creating backup...${NC}"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Configuration backed up to: $BACKUP_FILE${NC}"
    
    # Also backup the main nginx.conf
    NGINX_CONF="/etc/nginx/nginx.conf"
    NGINX_BACKUP="/etc/nginx/nginx.conf.backup.$TIMESTAMP"
    cp "$NGINX_CONF" "$NGINX_BACKUP"
    echo -e "${GREEN}✓ Main nginx.conf backed up to: $NGINX_BACKUP${NC}"
    
    # Show current backups
    echo -e "${BLUE}Available backups:${NC}"
    ls -la /etc/nginx/sites-available/*.backup.* 2>/dev/null || echo "No backups found"
}

restore_config() {
    echo -e "${YELLOW}Available configuration backups:${NC}"
    BACKUPS=($(ls /etc/nginx/sites-available/ivyarc.pro.backup.* 2>/dev/null))
    
    if [[ ${#BACKUPS[@]} -eq 0 ]]; then
        echo -e "${RED}No backup files found${NC}"
        return 1
    fi
    
    for i in "${!BACKUPS[@]}"; do
        echo "$((i+1)). ${BACKUPS[i]}"
    done
    
    echo -e "${YELLOW}Enter backup number to restore (or 0 to cancel):${NC}"
    read -r choice
    
    if [[ "$choice" -eq 0 ]]; then
        echo "Restore cancelled"
        return 0
    fi
    
    if [[ "$choice" -lt 1 ]] || [[ "$choice" -gt ${#BACKUPS[@]} ]]; then
        echo -e "${RED}Invalid selection${NC}"
        return 1
    fi
    
    SELECTED_BACKUP="${BACKUPS[$((choice-1))]}"
    echo -e "${YELLOW}Restoring from: $SELECTED_BACKUP${NC}"
    
    # Backup current config before restore
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp "$CONFIG_FILE" "${CONFIG_FILE}.pre_restore.$TIMESTAMP"
    echo -e "${BLUE}Current config backed up as: ${CONFIG_FILE}.pre_restore.$TIMESTAMP${NC}"
    
    # Restore
    cp "$SELECTED_BACKUP" "$CONFIG_FILE"
    echo -e "${GREEN}✓ Configuration restored${NC}"
    
    # Test the restored config
    if nginx -t; then
        echo -e "${GREEN}✓ Restored configuration is valid${NC}"
        echo -e "${YELLOW}Run '$0 reload' to apply changes${NC}"
    else
        echo -e "${RED}✗ Restored configuration has errors${NC}"
        echo "Please check the configuration manually"
    fi
}

# Main script logic
case "${1:-}" in
    "status")
        show_status
        ;;
    "test")
        test_config
        ;;
    "reload")
        reload_nginx
        ;;
    "restart")
        restart_nginx
        ;;
    "logs")
        show_logs
        ;;
    "backup")
        backup_config
        ;;
    "restore")
        restore_config
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    "")
        show_usage
        exit 1
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo
        show_usage
        exit 1
        ;;
esac