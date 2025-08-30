-- Create api_resources table
CREATE TABLE api_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    endpoint_pattern VARCHAR(200) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    required_permission_id BIGINT NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (required_permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_api_resources (service_name, endpoint_pattern, http_method)
);

-- Create indexes for better performance
CREATE INDEX idx_api_resources_service_endpoint ON api_resources (service_name, endpoint_pattern);
CREATE INDEX idx_api_resources_service ON api_resources (service_name);
CREATE INDEX idx_api_resources_active ON api_resources (is_active);

-- Insert default API resource configurations
INSERT INTO api_resources (service_name, endpoint_pattern, http_method, required_permission_id, description, priority) VALUES 

-- Auth Service API Resources
('auth-service', '/api/v1/auth/login', 'POST', (SELECT id FROM permissions WHERE name = 'public:read'), 'User login endpoint', 0),
('auth-service', '/api/v1/auth/register', 'POST', (SELECT id FROM permissions WHERE name = 'public:read'), 'User registration endpoint', 0),
('auth-service', '/api/v1/auth/refresh', 'POST', (SELECT id FROM permissions WHERE name = 'public:read'), 'Token refresh endpoint', 0),
('auth-service', '/api/v1/auth/logout', 'POST', (SELECT id FROM permissions WHERE name = 'user:read-self'), 'User logout endpoint', 0),
('auth-service', '/api/v1/auth/profile', 'GET', (SELECT id FROM permissions WHERE name = 'user:read-self'), 'Get user profile', 0),
('auth-service', '/api/v1/auth/profile', 'PUT', (SELECT id FROM permissions WHERE name = 'user:update-self'), 'Update user profile', 0),
('auth-service', '/api/v1/users', 'GET', (SELECT id FROM permissions WHERE name = 'user:read'), 'List users', 0),
('auth-service', '/api/v1/users/*', 'GET', (SELECT id FROM permissions WHERE name = 'user:read'), 'Get specific user', 0),
('auth-service', '/api/v1/users', 'POST', (SELECT id FROM permissions WHERE name = 'user:create'), 'Create user', 0),
('auth-service', '/api/v1/users/*', 'PUT', (SELECT id FROM permissions WHERE name = 'user:update'), 'Update user', 0),
('auth-service', '/api/v1/users/*', 'DELETE', (SELECT id FROM permissions WHERE name = 'user:delete'), 'Delete user', 0),

-- Authorization Service API Resources
('authorization-service', '/api/v1/roles', 'GET', (SELECT id FROM permissions WHERE name = 'role:read'), 'List roles', 0),
('authorization-service', '/api/v1/roles/*', 'GET', (SELECT id FROM permissions WHERE name = 'role:read'), 'Get specific role', 0),
('authorization-service', '/api/v1/roles', 'POST', (SELECT id FROM permissions WHERE name = 'role:create'), 'Create role', 0),
('authorization-service', '/api/v1/roles/*', 'PUT', (SELECT id FROM permissions WHERE name = 'role:update'), 'Update role', 0),
('authorization-service', '/api/v1/roles/*', 'DELETE', (SELECT id FROM permissions WHERE name = 'role:delete'), 'Delete role', 0),

('authorization-service', '/api/v1/permissions', 'GET', (SELECT id FROM permissions WHERE name = 'permission:read'), 'List permissions', 0),
('authorization-service', '/api/v1/permissions/*', 'GET', (SELECT id FROM permissions WHERE name = 'permission:read'), 'Get specific permission', 0),
('authorization-service', '/api/v1/permissions', 'POST', (SELECT id FROM permissions WHERE name = 'permission:create'), 'Create permission', 0),
('authorization-service', '/api/v1/permissions/*', 'PUT', (SELECT id FROM permissions WHERE name = 'permission:update'), 'Update permission', 0),
('authorization-service', '/api/v1/permissions/*', 'DELETE', (SELECT id FROM permissions WHERE name = 'permission:delete'), 'Delete permission', 0),

('authorization-service', '/api/v1/users/*/roles', 'GET', (SELECT id FROM permissions WHERE name = 'role:read'), 'Get user roles', 0),
('authorization-service', '/api/v1/users/*/roles', 'POST', (SELECT id FROM permissions WHERE name = 'role:assign'), 'Assign role to user', 0),
('authorization-service', '/api/v1/users/*/roles/*', 'DELETE', (SELECT id FROM permissions WHERE name = 'role:assign'), 'Remove role from user', 0),
('authorization-service', '/api/v1/users/*/permissions', 'GET', (SELECT id FROM permissions WHERE name = 'permission:read'), 'Get user permissions', 0),

('authorization-service', '/api/v1/authorize/check', 'POST', (SELECT id FROM permissions WHERE name = 'system:read'), 'Authorization check endpoint', 0),

-- API Gateway Service Resources (internal endpoints)
('api-gateway', '/actuator/**', 'GET', (SELECT id FROM permissions WHERE name = 'system:read'), 'Gateway actuator endpoints', 0),

-- Public endpoints (no authentication required)
('*', '/actuator/health', 'GET', (SELECT id FROM permissions WHERE name = 'public:read'), 'Health check endpoint', 0),
('*', '/actuator/info', 'GET', (SELECT id FROM permissions WHERE name = 'public:read'), 'Info endpoint', 0),
('*', '/api-docs/**', 'GET', (SELECT id FROM permissions WHERE name = 'public:read'), 'API documentation', 0),
('*', '/swagger-ui/**', 'GET', (SELECT id FROM permissions WHERE name = 'public:read'), 'Swagger UI', 0),
('*', '/h2-console/**', 'GET', (SELECT id FROM permissions WHERE name = 'system:admin'), 'H2 console access', 0),
('*', '/h2-console/**', 'POST', (SELECT id FROM permissions WHERE name = 'system:admin'), 'H2 console operations', 0);