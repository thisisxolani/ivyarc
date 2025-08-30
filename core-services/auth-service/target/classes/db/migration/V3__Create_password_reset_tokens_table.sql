-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used_at ON password_reset_tokens(used_at);
CREATE INDEX idx_password_reset_tokens_created_at ON password_reset_tokens(created_at);

-- Composite index for finding valid tokens
CREATE INDEX idx_password_reset_tokens_valid ON password_reset_tokens(token, expires_at, used_at);

-- Add constraints
ALTER TABLE password_reset_tokens ADD CONSTRAINT chk_expires_at_future CHECK (expires_at > created_at);
ALTER TABLE password_reset_tokens ADD CONSTRAINT chk_used_at_valid CHECK (used_at IS NULL OR used_at >= created_at);