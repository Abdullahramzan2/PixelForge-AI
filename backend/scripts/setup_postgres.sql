-- Run as PostgreSQL superuser (e.g. postgres)
-- psql -U postgres -f backend/scripts/setup_postgres.sql

CREATE USER pixelforge WITH PASSWORD 'pixelforge';

CREATE DATABASE pixelforge OWNER pixelforge;

GRANT ALL PRIVILEGES ON DATABASE pixelforge TO pixelforge;
