# Spring Cloud Auth System - Nginx Reverse Proxy Setup

## Overview
This nginx configuration serves the entire Spring Cloud auth system through a single port (80/443) with advanced features including SSL termination, load balancing, rate limiting, security headers, and comprehensive monitoring.

## Architecture
```
Internet -> Nginx (80/443) -> Spring Services
                           -> Angular Frontend (4200)
                           -> API Gateway (8082)
                           -> Eureka Server (8761) 
                           -> Config Server (8888)
                           -> Auth Service (8081)
```

## Main URLs and Endpoints

### Frontend Access
- **Main URL**: https://localhost/
- **Description**: Angular frontend application with full SPA routing support
- **Features**: WebSocket support for development server, static asset caching

### API Endpoints
- **API Gateway**: https://localhost/api/*
- **Description**: All API requests routed through Spring Cloud Gateway
- **Features**: CORS handling, rate limiting (100 req/min), request buffering

### Admin Interfaces
- **Eureka Dashboard**: https://localhost/admin/eureka
- **Config Server**: https://localhost/admin/config
- **Rate Limiting**: 5 requests/minute for admin endpoints

### Health Monitoring
- **Combined Health**: https://localhost/health
- **Frontend Health**: https://localhost/health/frontend
- **Eureka Health**: https://localhost/health/eureka
- **Config Server Health**: https://localhost/health/config
- **API Gateway Health**: https://localhost/health/api-gateway
- **Auth Service Health**: https://localhost/health/auth-service

### System Monitoring
- **Nginx Status**: https://localhost/nginx-status (localhost only)
- **Access Logs**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/logs/auth-system-access.log`
- **Error Logs**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/logs/auth-system-error.log`

## Configuration Files

### Main Configuration
- **Nginx Config**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/nginx.conf`
- **Site Config**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/sites-enabled/auth-system.conf`
- **SSL Certificate**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/ssl/auth-system.crt`
- **SSL Key**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/ssl/auth-system.key`

### Docker Configuration
- **Docker Compose**: `/root/spring-cloud-auth-workspace/infrastructure/nginx/docker-compose.yml`

## Advanced Features

### Security
- **SSL/TLS Termination**: TLSv1.2 and TLSv1.3 support
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Rate Limiting**: Different limits for API, auth, and admin endpoints
- **Connection Limits**: Per-IP and per-server connection limiting

### Load Balancing
- **Algorithm**: Least connections
- **Health Checks**: Automatic failover with configurable timeouts
- **Keepalive**: Persistent upstream connections
- **Multiple Instances**: Ready for horizontal scaling

### Performance
- **Gzip Compression**: Enabled for text and JSON content
- **Static Asset Caching**: 1-year expiration for static files
- **Request Buffering**: Optimized for API responses
- **WebSocket Support**: Full support for Angular development server

### Monitoring & Logging
- **Custom Log Format**: Detailed request tracking with upstream information
- **Error Pages**: Custom 404 and 50x error pages
- **Nginx Status**: Real-time connection and request statistics

## Service Status

### Currently Running Services
- ✅ **Frontend (Angular)**: http://localhost:4200 - Accessible via nginx
- ✅ **Eureka Server**: http://localhost:8761 - Health checks working
- ✅ **Config Server**: http://localhost:8888 - Health checks working
- ❌ **Auth Service**: http://localhost:8081 - Startup issues with JPA queries
- ❓ **API Gateway**: http://localhost:8082 - Not started yet

### Nginx Status
- ✅ **Nginx Process**: Running with custom configuration
- ✅ **SSL Certificate**: Self-signed certificate working
- ✅ **Health Endpoints**: All working except auth service
- ✅ **Admin Interfaces**: Eureka and Config Server accessible

## Testing Commands

### Basic Connectivity
```bash
# Test main health endpoint
curl -k -s https://localhost/health

# Test individual services
curl -k -s https://localhost/health/eureka
curl -k -s https://localhost/health/config

# Test frontend
curl -k -s https://localhost/ | head -5

# Test admin interfaces
curl -k -s https://localhost/admin/eureka | head -10
```

### Monitoring
```bash
# Check nginx status
curl -k -s https://localhost/nginx-status

# View access logs
tail -f /root/spring-cloud-auth-workspace/infrastructure/nginx/logs/auth-system-access.log

# View error logs  
tail -f /root/spring-cloud-auth-workspace/infrastructure/nginx/logs/auth-system-error.log
```

### Rate Limiting Test
```bash
# Test API rate limiting (100 req/min)
for i in {1..5}; do curl -k -s https://localhost/api/health; done

# Test admin rate limiting (5 req/min)
for i in {1..3}; do curl -k -s https://localhost/admin/eureka > /dev/null; done
```

## Starting/Stopping Nginx

### Manual Control
```bash
# Start with custom config
nginx -c /root/spring-cloud-auth-workspace/infrastructure/nginx/nginx.conf

# Test configuration
nginx -t -c /root/spring-cloud-auth-workspace/infrastructure/nginx/nginx.conf

# Reload configuration
nginx -s reload -c /root/spring-cloud-auth-workspace/infrastructure/nginx/nginx.conf

# Stop nginx
nginx -s quit
```

### Process Management
```bash
# Check processes
ps aux | grep nginx

# Check listening ports
ss -tlnp | grep -E ':80|:443'
```

## Next Steps

1. **Fix Auth Service**: Resolve JPA query issues in PasswordResetTokenRepository
2. **Start API Gateway**: Launch the API Gateway service on port 8082
3. **Add More Services**: Configure additional microservices as needed
4. **Production SSL**: Replace self-signed certificate with proper SSL certificate
5. **Monitoring Integration**: Add Prometheus metrics collection
6. **Log Aggregation**: Set up centralized logging with ELK stack

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure no other services are using ports 80/443
2. **SSL Warnings**: Browser will show warnings for self-signed certificate
3. **Service Unavailable**: Check if backend services are running
4. **Rate Limiting**: May need to adjust rate limits based on usage patterns

### Log Analysis
- Check nginx error log for configuration issues
- Monitor access log for request patterns and response codes  
- Use nginx status endpoint for real-time connection monitoring

This nginx setup provides a production-ready reverse proxy with comprehensive security, monitoring, and scalability features for your Spring Cloud auth system.