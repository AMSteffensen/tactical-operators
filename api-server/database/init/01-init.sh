#!/bin/bash
set -e

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Set timezone
    SET timezone = 'UTC';
    
    -- Create any additional database setup here
    GRANT ALL PRIVILEGES ON DATABASE tactical_operator TO tactical_user;
EOSQL

echo "Database initialization completed!"
