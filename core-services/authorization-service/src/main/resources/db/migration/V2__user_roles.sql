CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  username VARCHAR(128) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE
);

-- Seed mapping for demo user
INSERT INTO user_roles (username, role_id)
  SELECT 'admin', r.id FROM roles r WHERE r.name = 'ADMIN'
  ON CONFLICT DO NOTHING;

