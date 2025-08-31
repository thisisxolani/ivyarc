-- =============================================================================
-- IvyArc Spring Cloud Microservices - Database Initialization
-- =============================================================================
-- This script creates individual databases for each microservice
-- and sets up the necessary users and permissions

-- Create databases for each microservice
CREATE DATABASE auth_db;
CREATE DATABASE auth_db_dev;
CREATE DATABASE authorization_db;
CREATE DATABASE authorization_db_dev;
CREATE DATABASE user_management_db;
CREATE DATABASE user_management_db_dev;
CREATE DATABASE audit_db;
CREATE DATABASE audit_db_dev;

-- Create service-specific users with limited permissions
CREATE USER auth_user WITH ENCRYPTED PASSWORD 'auth_password';
CREATE USER authorization_user WITH ENCRYPTED PASSWORD 'authorization_password';
CREATE USER user_management_user WITH ENCRYPTED PASSWORD 'user_management_password';
CREATE USER audit_user WITH ENCRYPTED PASSWORD 'audit_password';

-- Grant permissions to service users on their respective databases
-- Auth Service
GRANT CONNECT ON DATABASE auth_db TO auth_user;
GRANT CONNECT ON DATABASE auth_db_dev TO auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db_dev TO auth_user;

-- Authorization Service
GRANT CONNECT ON DATABASE authorization_db TO authorization_user;
GRANT CONNECT ON DATABASE authorization_db_dev TO authorization_user;
GRANT ALL PRIVILEGES ON DATABASE authorization_db TO authorization_user;
GRANT ALL PRIVILEGES ON DATABASE authorization_db_dev TO authorization_user;

-- User Management Service
GRANT CONNECT ON DATABASE user_management_db TO user_management_user;
GRANT CONNECT ON DATABASE user_management_db_dev TO user_management_user;
GRANT ALL PRIVILEGES ON DATABASE user_management_db TO user_management_user;
GRANT ALL PRIVILEGES ON DATABASE user_management_db_dev TO user_management_user;

-- Audit Service
GRANT CONNECT ON DATABASE audit_db TO audit_user;
GRANT CONNECT ON DATABASE audit_db_dev TO audit_user;
GRANT ALL PRIVILEGES ON DATABASE audit_db TO audit_user;
GRANT ALL PRIVILEGES ON DATABASE audit_db_dev TO audit_user;

-- Connect to each database and grant schema permissions
\c auth_db;
GRANT ALL ON SCHEMA public TO auth_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_user;

\c auth_db_dev;
GRANT ALL ON SCHEMA public TO auth_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_user;

\c authorization_db;
GRANT ALL ON SCHEMA public TO authorization_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authorization_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authorization_user;

\c authorization_db_dev;
GRANT ALL ON SCHEMA public TO authorization_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authorization_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authorization_user;

\c user_management_db;
GRANT ALL ON SCHEMA public TO user_management_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_management_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_management_user;

\c user_management_db_dev;
GRANT ALL ON SCHEMA public TO user_management_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_management_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_management_user;

\c audit_db;
GRANT ALL ON SCHEMA public TO audit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audit_user;

\c audit_db_dev;
GRANT ALL ON SCHEMA public TO audit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audit_user;

-- Create extensions that might be needed
\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c authorization_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c user_management_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c audit_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Output completion message
SELECT 'Database initialization completed successfully!' as status;