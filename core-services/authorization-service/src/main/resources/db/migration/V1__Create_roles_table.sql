-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_role_name ON roles (name);
CREATE INDEX idx_role_active ON roles (is_active);

-- Insert default system roles
INSERT INTO roles (name, description, is_active, is_system) VALUES 
('GUEST', 'Guest role with minimal permissions', TRUE, TRUE),
('USER', 'Standard user role', TRUE, TRUE),
('ADMIN', 'Administrator role with elevated permissions', TRUE, TRUE),
('SUPER_ADMIN', 'Super administrator with full system access', TRUE, TRUE),
('SYSTEM', 'System role for service-to-service communication', TRUE, TRUE),
('SERVICE', 'Service role for internal microservice operations', TRUE, TRUE);