#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting database creation process..."

create_db_safe() {
    local db_name=$1
    
    # 1. Check db exists
    exists=$(psql -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$db_name'" 2>/dev/null)
    
    if [ "$exists" = "1" ]; then
        echo -e "${GREEN}SKIP:${NC} Database '$db_name' already exists."
    else
        # 2. Create new if not exists
        if psql -U "$POSTGRES_USER" -c "CREATE DATABASE $db_name" 2>/dev/null; then
            echo -e "${GREEN}SUCCESS:${NC} Database '$db_name' created successfully."
        else
            # 3. If err, then echo
            echo -e "${RED}ERROR:${NC} Failed to create database '$db_name'. Please check logs."
        fi
    fi
}

run_sql_script() {
    local db_name=$1
    local file_path=$2
    
    echo "--- Executing $file_path into $db_name ---"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}ERROR:${NC} File $file_path NOT FOUND!"
        exit 1
    fi

    if psql -U "$POSTGRES_USER" -d "$db_name" -f "$file_path"; then
        echo -e "${GREEN}SUCCESS:${NC} Applied $file_path to $db_name"
    else
        echo -e "${RED}CRITICAL ERROR:${NC} Failed to apply $file_path to $db_name"
        exit 1 
    fi
}

# Core Services
create_db_safe "hr_tech_application_db"
run_sql_script "hr_tech_application_db" "/docker-entrypoint-initdb.d/schemas/schema.sql"

# Seed data

# seed test release

echo "Database initialization process finished!"