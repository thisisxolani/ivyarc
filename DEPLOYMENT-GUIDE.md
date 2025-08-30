# IvyArc.pro Nginx Reverse Proxy Deployment Guide

## Overview
This guide documents the complete nginx reverse proxy setup for ivyarc.pro that serves the Angular dashboard and proxies requests to Spring Cloud backend services.

## Architecture
```
Internet → nginx (SSL Termination) → {Angular Static Files | Spring Cloud Services}
                                     ↓
                                   - Auth Service (8081)
                                   - User Service (8083)
                                   - Audit Service (8084)
                                   - Angular Dev Server (4200) [Development]
```

## Configuration Files

### 1. Main Configuration
- **File**: `/etc/nginx/sites-available/ivyarc.pro`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/ivyarc.pro`

### 2. SSL Certificates
- **Certificate**: `/etc/ssl/nginx/ivyarc_pro_fullchain.crt`
- **Private Key**: `/etc/ssl/nginx/ivyarc_pro.key`

### 3. Static Files
- **Production**: `/root/spring-cloud-auth-workspace/frontend/auth-app/dist/`
- **Development**: Proxied to Angular dev server on port 4200

## URL Routing

| URL Pattern | Destination | Purpose |
|-------------|-------------|---------|
| `/` | Static files or Angular dev server | Main dashboard |
| `/api/v1/auth/*` | http://localhost:8081 | Authentication service |
| `/api/v1/users/*` | http://localhost:8083 | User management service |
| `/api/v1/audit/*` | http://localhost:8084 | Audit logging service |
| `/health` | nginx health check | Monitoring |
| `/robots.txt` | nginx generated | SEO |
| `/sockjs-node` | Angular dev server | WebSocket (dev) |
| `/ws` | Angular dev server | Hot reload (dev) |

## Features Implemented

### ✅ Security
- **SSL/TLS**: TLS 1.2 and 1.3 with strong ciphers
- **HSTS**: Strict-Transport-Security headers
- **CSP**: Content Security Policy
- **XSS Protection**: X-XSS-Protection headers
- **Frame Options**: X-Frame-Options for clickjacking prevention
- **Content Type**: X-Content-Type-Options nosniff
- **OCSP Stapling**: SSL certificate validation

### ✅ Performance
- **HTTP/2**: Enabled for better performance
- **Gzip Compression**: 60%+ size reduction for text content
- **Static Asset Caching**: Long-term caching for JS/CSS/images
- **Connection Optimization**: Keep-alive, TCP optimizations

### ✅ CORS & API Support
- **CORS Headers**: Proper cross-origin resource sharing
- **Preflight Handling**: OPTIONS requests handled correctly
- **Rate Limiting**: API protection (auth: 5r/s, general: 10r/s)
- **Load Balancing**: Upstream definitions with health checks

### ✅ Development Support
- **WebSocket Proxying**: Hot reload support for Angular dev server
- **Fallback Logic**: Static files first, then dev server
- **Error Handling**: Graceful degradation when services are down

### ✅ Monitoring & Logging
- **Access Logs**: `/var/log/nginx/ivyarc.pro.access.log`
- **Error Logs**: `/var/log/nginx/ivyarc.pro.error.log`
- **Health Endpoint**: `/health` for monitoring
- **Status Codes**: Proper HTTP status codes for different scenarios

## Deployment Modes

### Production Mode
```bash
# Build Angular application
cd /root/spring-cloud-auth-workspace/frontend/auth-app
ng build --configuration production

# Start backend services
./scripts/start-auth-service.sh
./scripts/start-user-service.sh
./scripts/start-audit-service.sh

# Nginx automatically serves static files from dist/
```

### Development Mode
```bash
# Start Angular dev server
cd /root/spring-cloud-auth-workspace/frontend/auth-app
ng serve --host 0.0.0.0 --port 4200

# Start backend services (optional)
./scripts/start-auth-service.sh
./scripts/start-user-service.sh
./scripts/start-audit-service.sh

# Nginx proxies to Angular dev server when static files don't exist
```

## Testing

### Automated Testing
```bash
# Run comprehensive test suite
/root/spring-cloud-auth-workspace/scripts/test-nginx-proxy.sh
```

### Manual Testing
```bash
# Test SSL and static files
curl -k https://ivyarc.pro/

# Test API proxying
curl -k https://ivyarc.pro/api/v1/auth/health
curl -k https://ivyarc.pro/api/v1/users/health
curl -k https://ivyarc.pro/api/v1/audit/health

# Test CORS
curl -k -H "Origin: https://ivyarc.pro" -X OPTIONS https://ivyarc.pro/api/v1/auth/test

# Test compression
curl -k -H "Accept-Encoding: gzip" https://ivyarc.pro/
```

## Configuration Management

### Backup Configuration
```bash
# Backup current config
cp /etc/nginx/sites-available/ivyarc.pro /etc/nginx/sites-available/ivyarc.pro.backup.$(date +%Y%m%d)
```

### Validate Configuration
```bash
# Test nginx configuration
nginx -t

# Reload nginx (zero-downtime)
systemctl reload nginx

# Restart nginx (if needed)
systemctl restart nginx
```

### Log Management
```bash
# Monitor logs in real-time
tail -f /var/log/nginx/ivyarc.pro.access.log
tail -f /var/log/nginx/ivyarc.pro.error.log

# Log rotation (automatic via logrotate)
logrotate -f /etc/logrotate.d/nginx
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Backend service not running
   - Port conflicts
   - Firewall blocking connections

2. **Permission Denied**
   - Check file permissions: `chmod 755 /root`
   - Check ownership: `chown -R www-data:www-data /path/to/static/files`

3. **SSL Issues**
   - Certificate expired or invalid
   - Check certificate chain: `openssl verify -CAfile ca.crt ivyarc_pro_fullchain.crt`

4. **CORS Errors**
   - Check Origin headers
   - Verify preflight requests

### Debug Commands
```bash
# Check nginx processes
ps aux | grep nginx

# Check listening ports
ss -tlnp | grep nginx

# Test nginx configuration
nginx -T

# Check SSL certificate
openssl x509 -in /etc/ssl/nginx/ivyarc_pro_fullchain.crt -text -noout
```

## Performance Optimization

### Current Optimizations
- Worker processes: Auto (matches CPU cores)
- Worker connections: 1024 per process
- Gzip compression: Level 6 (balanced speed/compression)
- Keep-alive timeout: 65 seconds
- Static asset caching: 1 year for immutable assets

### Monitoring Metrics
- Response times: Monitor via access logs
- Error rates: Monitor 4xx/5xx in access logs
- Compression ratios: Compare content-length headers
- SSL handshake time: Monitor SSL negotiation performance

## Security Considerations

### Implemented Security Measures
- TLS 1.2+ only (no older protocols)
- Strong cipher suites
- HSTS with preload
- Content Security Policy
- Rate limiting by IP
- Server tokens disabled

### Additional Security Recommendations
- Regular certificate renewal (Let's Encrypt/commercial CA)
- Web Application Firewall (WAF) integration
- DDoS protection via CloudFlare/AWS Shield
- Regular security audits and updates

## Maintenance Tasks

### Weekly
- Review error logs for issues
- Check certificate expiration dates
- Monitor disk usage for log files

### Monthly
- Update nginx to latest stable version
- Review and update security headers
- Performance analysis and optimization

### Quarterly
- Full security audit
- Load testing
- Certificate renewal (if needed)
- Configuration backup and documentation update

## Contact & Support
For issues or questions regarding this deployment:
- Configuration files: `/etc/nginx/sites-available/ivyarc.pro`
- Test suite: `/root/spring-cloud-auth-workspace/scripts/test-nginx-proxy.sh`
- Logs: `/var/log/nginx/ivyarc.pro.*`