# Database setup

## Local database setup

### Dependencies
* Flyway
  * Flyway is a database migration tool that keeps track of each change to the database
  * Migrations are stored in db/migrations
  * Mac Install: `brew install flyway`
  * Other OS install: https://flywaydb.org/download/
* Postgres
  * If you are on a linux computer, you might have to follow the instructions [here](https://stackoverflow.com/a/21889759) to change the default authentication from "peer" to "md5".


### Initialize the database

#### Mac
```
yarn db-init:dev
```

#### Linux
```
sudo -u postgres yarn db-init:dev

```


### Run database migrations
Every time a new migration file is added, Flyway must be run again to apply the migration.
```
yarn db-migrate:dev
```


### Import test results
To import test data into the local database, run:
```
yarn db-import-tests:dev
```

### Inspecting the database

To connect to the Postgres table locally (with psql), export these variables:
```
export PGDATABASE=aria_at_report
export PGUSER=atr
export PGPASSWORD=atr
export PGHOST=localhost
export PGPORT=5432
export ROOTUSER=$USER
```