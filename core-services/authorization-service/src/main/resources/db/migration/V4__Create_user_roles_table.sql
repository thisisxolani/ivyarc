-- Create user_roles table
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_roles (user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_user_roles_expires_at ON user_roles (expires_at);
CREATE INDEX idx_user_roles_user_role ON user_roles (user_id, role_id);

-- Note: We don't insert default user-role assignments here since users are managed 
-- by the auth-service. This table will be populated when users are assigned roles
-- through the authorization service APIs.