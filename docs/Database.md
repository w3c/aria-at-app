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


## Run database migrations
Every time a new migration file is added, Flyway must be run again to apply the migration.

### Dev
```
yarn db-migrate:dev
```


## Local PG development

To connect to the Postgres table locally, export these variables:
```
PGDATABASE=aria_at_report
PGUSER=atr
PGPASSWORD=atr
PGHOST=localhost
PGPORT=5432
```