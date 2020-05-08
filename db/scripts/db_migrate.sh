#!/bin/bash

set -euo pipefail

ENV_FILE=$1

source $ENV_FILE

# Show all the migrations
flyway info -user=$PGUSER -password=$PGPASSWORD -url=jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE -locations=filesystem:$(pwd)/db/migrations -baselineVersion=0 -baselineOnMigrate=true

# Perform the migration
flyway migrate -user=$PGUSER -password=$PGPASSWORD -url=jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE -locations=filesystem:$(pwd)/db/migrations -baselineVersion=0 -baselineOnMigrate=true

# Validate the migration
flyway validate -user=$PGUSER -password=$PGPASSWORD -url=jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE -locations=filesystem:$(pwd)/db/migrations -baselineVersion=0 -baselineOnMigrate=true