-- Create user_roles table
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id BIGINT NOT NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_roles UNIQUE (user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_user_roles_expires_at ON user_roles (expires_at);
CREATE INDEX idx_user_roles_user_role ON user_roles (user_id, role_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: We don't insert default user-role assignments here since users are managed 
-- by the auth-service. This table will be populated when users are assigned roles
-- through the authorization service APIs.