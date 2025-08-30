-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_role_permissions_role ON role_permissions (role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions (permission_id);

-- Assign default permissions to system roles
-- GUEST role permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'GUEST' AND p.name IN ('public:read');

-- USER role permissions (includes GUEST permissions + user self-management)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'USER' AND p.name IN (
    'public:read',
    'user:read-self',
    'user:update-self'
);

-- ADMIN role permissions (includes USER permissions + admin capabilities)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN' AND p.name IN (
    'public:read',
    'user:read-self',
    'user:update-self',
    'user:*',
    'role:*',
    'permission:read',
    'api-resource:read',
    'system:read'
);

-- SUPER_ADMIN role permissions (full access)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SUPER_ADMIN' AND p.name = '*:*';

-- SYSTEM role permissions (service-to-service communication)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SYSTEM' AND p.name IN (
    'user:read',
    'role:read',
    'permission:read',
    'api-resource:read',
    'system:read'
);

-- SERVICE role permissions (internal microservice operations)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SERVICE' AND p.name IN (
    'public:read',
    'user:read',
    'role:read',
    'permission:read'
);