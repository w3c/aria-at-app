#!/bin/bash

ENVIRONMENT=$1

function create_dev_db() {
    echo "Creating aria_at_report database..."
    createdb aria_at_report && echo "Created!" || echo "Error creating database!"
    psql -c "CREATE ROLE atr WITH LOGIN PASSWORD 'atr'" || echo "Error creating role"
    psql -c "GRANT ALL PRIVILEGES ON DATABASE aria_at_report to atr;" || echo "Error granting privileges"
}

if [ "$ENVIRONMENT" == "dev" ];
then
    create_dev_db
fi
