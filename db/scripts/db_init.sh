#!/bin/bash

set -euo pipefail

source $1

result="$(psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}'")"

if [[ $result = '1' ]]; then
  echo "Database ${PGDATABASE} already exists."
else
  echo "Creating ${PGDATABASE} database..."

  createdb ${PGDATABASE} && echo "Created!" || echo "Error creating database!"
fi

result="$(psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${PGUSER}'")"

if [ $result = '1' ]; then
  echo "User ${PGUSER} already exists."
else
  echo "Creating ${PGUSER} user..."

  psql -c "CREATE ROLE ${PGUSER} WITH LOGIN PASSWORD '${PGPASSWORD}'" || echo "Error creating role"
  psql -c "GRANT ALL PRIVILEGES ON DATABASE ${PGDATABASE} to ${PGUSER};" || echo "Error granting privileges"
fi
