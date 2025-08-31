-- Initialize databases for IvyArc Spring Cloud services
-- This script creates separate databases for each service

-- Create auth service database
CREATE DATABASE auth_service_db;
CREATE USER auth_service_user WITH ENCRYPTED PASSWORD 'auth_service_secure_password';
GRANT ALL PRIVILEGES ON DATABASE auth_service_db TO auth_service_user;

-- Create authorization service database  
CREATE DATABASE authorization_service_db;
CREATE USER authorization_service_user WITH ENCRYPTED PASSWORD 'authorization_service_secure_password';
GRANT ALL PRIVILEGES ON DATABASE authorization_service_db TO authorization_service_user;

-- Create user management service database
CREATE DATABASE user_service_db;
CREATE USER user_service_user WITH ENCRYPTED PASSWORD 'user_service_secure_password';
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO user_service_user;

-- Create audit service database
CREATE DATABASE audit_service_db;
CREATE USER audit_service_user WITH ENCRYPTED PASSWORD 'audit_service_secure_password';
GRANT ALL PRIVILEGES ON DATABASE audit_service_db TO audit_service_user;

-- Enable required extensions
\c auth_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

\c authorization_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

\c user_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

\c audit_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create shared read-only user for monitoring/reporting
CREATE USER readonly_user WITH ENCRYPTED PASSWORD 'readonly_secure_password';
GRANT CONNECT ON DATABASE auth_service_db TO readonly_user;
GRANT CONNECT ON DATABASE authorization_service_db TO readonly_user;
GRANT CONNECT ON DATABASE user_service_db TO readonly_user;
GRANT CONNECT ON DATABASE audit_service_db TO readonly_user;

-- Grant usage on schemas and select on tables (to be run after table creation)
-- This would typically be done via migration scripts