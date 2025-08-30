-- Sample data for testing (H2 database)
-- This file is only loaded when using H2 in test mode

-- Assign default role to a test user (assuming user with ID 1 exists from auth-service)
-- INSERT INTO user_roles (user_id, role_id, is_active) 
-- SELECT 1, r.id, TRUE
-- FROM roles r 
-- WHERE r.name = 'USER'
-- ON CONFLICT (user_id, role_id) DO NOTHING;

-- Note: User role assignments will be handled through the service APIs
-- This file is kept minimal to avoid conflicts with actual user data