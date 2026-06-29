-- Run as PostgreSQL superuser (e.g. postgres)
-- psql -U postgres -f backend/scripts/setup_postgres.sql

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pixelforge') THEN
        CREATE USER pixelforge WITH PASSWORD 'pixelforge';
    ELSE
        ALTER USER pixelforge WITH PASSWORD 'pixelforge';
    END IF;
END
$$;

SELECT 'CREATE DATABASE pixelforge OWNER pixelforge'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pixelforge')\gexec

GRANT ALL PRIVILEGES ON DATABASE pixelforge TO pixelforge;
