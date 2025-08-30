-- Create permissions table
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_permission_name ON permissions (name);
CREATE INDEX idx_permission_resource_action ON permissions (resource, action);
CREATE INDEX idx_permission_active ON permissions (is_active);

-- Insert default system permissions
INSERT INTO permissions (name, resource, action, description, is_active, is_system) VALUES 
-- Public permissions
('public:read', 'public', 'read', 'Read access to public resources', TRUE, TRUE),

-- User permissions
('user:read-self', 'user', 'read-self', 'Read own user profile', TRUE, TRUE),
('user:update-self', 'user', 'update-self', 'Update own user profile', TRUE, TRUE),
('user:read', 'user', 'read', 'Read user profiles', TRUE, TRUE),
('user:create', 'user', 'create', 'Create new users', TRUE, TRUE),
('user:update', 'user', 'update', 'Update user profiles', TRUE, TRUE),
('user:delete', 'user', 'delete', 'Delete users', TRUE, TRUE),
('user:*', 'user', '*', 'All user operations', TRUE, TRUE),

-- Role permissions
('role:read', 'role', 'read', 'Read roles', TRUE, TRUE),
('role:create', 'role', 'create', 'Create new roles', TRUE, TRUE),
('role:update', 'role', 'update', 'Update roles', TRUE, TRUE),
('role:delete', 'role', 'delete', 'Delete roles', TRUE, TRUE),
('role:assign', 'role', 'assign', 'Assign roles to users', TRUE, TRUE),
('role:*', 'role', '*', 'All role operations', TRUE, TRUE),

-- Permission permissions
('permission:read', 'permission', 'read', 'Read permissions', TRUE, TRUE),
('permission:create', 'permission', 'create', 'Create new permissions', TRUE, TRUE),
('permission:update', 'permission', 'update', 'Update permissions', TRUE, TRUE),
('permission:delete', 'permission', 'delete', 'Delete permissions', TRUE, TRUE),
('permission:*', 'permission', '*', 'All permission operations', TRUE, TRUE),

-- API Resource permissions
('api-resource:read', 'api-resource', 'read', 'Read API resource configurations', TRUE, TRUE),
('api-resource:create', 'api-resource', 'create', 'Create API resource configurations', TRUE, TRUE),
('api-resource:update', 'api-resource', 'update', 'Update API resource configurations', TRUE, TRUE),
('api-resource:delete', 'api-resource', 'delete', 'Delete API resource configurations', TRUE, TRUE),
('api-resource:*', 'api-resource', '*', 'All API resource operations', TRUE, TRUE),

-- System permissions
('system:read', 'system', 'read', 'Read system information', TRUE, TRUE),
('system:admin', 'system', 'admin', 'System administration access', TRUE, TRUE),
('system:*', 'system', '*', 'All system operations', TRUE, TRUE),

-- Super admin permission (grants all access)
('*:*', '*', '*', 'All permissions for all resources', TRUE, TRUE);