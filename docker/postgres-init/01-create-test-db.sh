#!/bin/bash
set -e

# Create test database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE worksite_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'worksite_test')\gexec
    
    GRANT ALL PRIVILEGES ON DATABASE worksite_test TO $POSTGRES_USER;
EOSQL

echo "✅ Test database 'worksite_test' created successfully"
