# Database setup

## Local database setup

### Initialize the database

#### Mac
```
createdb # run this if the PostgreSQL installation is freshly installed
yarn db-init:dev
```

#### Linux
```
sudo -u postgres yarn db-init:dev

```

### Run database migrations
Every time a new migration file is added it must be run again to apply the migration.
```
yarn run sequelize -- db:migrate
```

### Import seed data
To import seed data into the local database
```
yarn run sequelize -- db:seed:all
```

### Import test results
To import test data into the local database, run:
```
yarn db-import-tests:dev
```

### Inspecting the database

To connect to the Postgres table locally:
```
yarn run dotenv -e config/dev.env psql
```

### Destroying Flyway Managed Database and Migrating to Sequelize
**Note: These instructions were performed on a Mac. Other OS users, please update these docs in a separate PR.**

This section is for users who were previously managing their database using Flyway. The application has moved away from using Flyway for database management in favor of Sequelize. To change the database management to Sequelize, follow these instructions:

#### 1. Destroy Database
- Flyway clear out the database by undoing the migrations:
```
flyway clean -user=$PGUSER -password=$PGPASSWORD -url=jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE -locations=filesystem:$(pwd)/db/migrations -baselineVersion=0 -baselineOnMigrate=true
```
- Reset PostgreSQL variables
```
export PGDATABASE=
export PGUSER=
export PGPASSWORD=
export PGHOST=
export PGPORT=
```

- Drop the database
  - `psql -c "DROP DATABASE aria_at_report;"`

#### 2. Initialize a new database

- Follow the **Local database setup** instructions above, starting with **Initialize the database**
- Follow the **Import test results** instructions above.
- Run app as usual.

