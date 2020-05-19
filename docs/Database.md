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
