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
yarn sequelize db:migrate
```

### Import seed data
To import seed data into the local database
```
yarn sequelize db:seed:all
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

#### 0. Open a new terminal and set environment
- These instructions should not be performed in the same terminal as the terminal where the app is being run.
- Export dev Postgres variables:
  - `export $(cat config/dev.env | xargs)`
- Go to the `aria-at-app` server folder
  - `cd server`

#### 1. Destroy Database
- Flyway clear out the database by undoing the migrations:
```
flyway clean -user=$PGUSER -password=$PGPASSWORD -url=jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE -locations=filesystem:$(pwd)/db/migrations -baselineVersion=0 -baselineOnMigrate=true
```
- Unset PostgreSQL variables
```
unset PGDATABASE
unset PGUSER
unset PGPASSWORD
unset PGHOST
unset PGPORT
```

- Drop the database
  - `psql -c "DROP DATABASE aria_at_report;"`

- Go to the root application folder
  - `cd ../`

#### 2. Initialize a new database

- Follow the **Local database setup** instructions above, starting with **Initialize the database**
- Follow the **Import test results** instructions above.
- Run app as usual.

