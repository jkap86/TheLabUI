CREATE TABLE IF NOT EXISTS common (
    name VARCHAR(255) PRIMARY KEY,
    data JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);