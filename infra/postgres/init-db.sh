#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init-db.sh
#
# Runs automatically once on first container boot (mounted into
# /docker-entrypoint-initdb.d/).
#
# The Postgres Docker image already creates the database named by POSTGRES_DB
# (used by Keycloak). We need a *second* database for the FastAPI application.
# ─────────────────────────────────────────────────────────────────────────────
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the FastAPI application database if it does not already exist
    SELECT 'CREATE DATABASE app_data'
    WHERE NOT EXISTS (
        SELECT FROM pg_database WHERE datname = 'app_data'
    )\gexec

    -- Grant full privileges to the shared DB user
    GRANT ALL PRIVILEGES ON DATABASE app_data TO $POSTGRES_USER;
EOSQL

echo ">>> init-db.sh: app_data database ready."
