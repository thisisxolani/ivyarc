-- Create initial admin user (password: admin123)
-- Note: In production, this should be removed or password should be changed immediately
INSERT INTO users (
    id,
    username, 
    email, 
    password_hash,
    first_name,
    last_name,
    is_active,
    is_verified,
    is_locked,
    failed_login_attempts,
    password_changed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@company.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkVLWdgGlqfx.s6', -- BCrypt hash of 'admin123'
    'System',
    'Administrator',
    true,
    true,
    false,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create a test user (password: test123)
-- Note: This should be removed in production
INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    first_name,
    last_name,
    is_active,
    is_verified,
    is_locked,
    failed_login_attempts,
    password_changed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'testuser',
    'test@company.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- BCrypt hash of 'test123'
    'Test',
    'User',
    true,
    true,
    false,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);