-- Create audit_events table for audit service
CREATE TABLE audit_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    resource VARCHAR(255),
    action VARCHAR(100),
    status VARCHAR(50),
    details TEXT,
    request_id VARCHAR(255),
    correlation_id VARCHAR(255),
    duration_ms BIGINT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp DESC);
CREATE INDEX idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX idx_audit_events_service_name ON audit_events(service_name);
CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_status ON audit_events(status);
CREATE INDEX idx_audit_events_ip_address ON audit_events(ip_address);
CREATE INDEX idx_audit_events_session_id ON audit_events(session_id);
CREATE INDEX idx_audit_events_request_id ON audit_events(request_id);
CREATE INDEX idx_audit_events_correlation_id ON audit_events(correlation_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_audit_events_user_timestamp ON audit_events(user_id, timestamp DESC);
CREATE INDEX idx_audit_events_service_timestamp ON audit_events(service_name, timestamp DESC);
CREATE INDEX idx_audit_events_event_timestamp ON audit_events(event_type, timestamp DESC);
CREATE INDEX idx_audit_events_status_timestamp ON audit_events(status, timestamp DESC);

-- Index for security events
CREATE INDEX idx_audit_events_security ON audit_events(event_type, timestamp DESC) 
    WHERE event_type IN ('LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY');

-- Partial index for failed events
CREATE INDEX idx_audit_events_failed ON audit_events(timestamp DESC) 
    WHERE status LIKE 'FAILED%';

-- Index for recent events (last 30 days) - commonly queried
CREATE INDEX idx_audit_events_recent ON audit_events(timestamp DESC) 
    WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '30 days';