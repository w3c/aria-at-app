# Local Database

The database migrations are managed by [Sequelize](https://sequelize.org/). To read and understand the schema, see the Sequelize models that represent the data in `server/models`. Each model represents a table in the database.

## Setting up a local database for development
0. Install PostgreSQL
    - Mac 
    ```
    brew install postgresql@14
    brew services start postgresql@14
    ```

1. Initialize the database
    - Mac
    ```
    createdb # run this if the PostgreSQL installation is freshly installed
    yarn db-init:dev
    ```
    - Linux
    ```
    su root
    su postgres
    yarn db-init:dev
    ```
2. Run database migrations
    ```
    yarn sequelize db:migrate
    ```
3. Import seed data
    ```
    yarn sequelize db:seed:all
    ```
4. Import the most recent tests from the [aria-at repository](https://github.com/w3c/aria-at):
    ```
    yarn db-import-tests:dev
    ```

All at once:

```
if [[ "$OSTYPE" == "darwin"* ]]; then
    createdb # run this if the PostgreSQL installation is freshly installed
    yarn db-init:dev;
else
    sudo -u postgres yarn db-init:dev;
fi;

yarn sequelize db:migrate;
yarn sequelize db:seed:all;
yarn db-import-tests:dev;
```

The sample data which is used in test environments can also be populated on development environments.

```
yarn workspace server db-populate-sample-data:dev;
```

### Cloning the Production Database

The prerequisite for the following steps is SSH access to the production server.

1. Follow the [manual backup instructions](../deploy/README.md#manual-db-backup) which will produce a local database dump of the production database.
2. Drop your **local** aria_at_report database using your preferred tool.
3. Initialize the database in an empty state:
    ```
    if [[ "$OSTYPE" == "darwin"* ]]; then
        createdb # run this if the PostgreSQL installation is freshly installed
        yarn db-init:dev;
    else
        sudo -u postgres yarn db-init:dev;
    fi;
    ```
4. Execute the database dump file:
    ```
    psql -d aria_at_report -f <environment>_dump_<timestamp>.sql
    ```

## Test Database

The instructions are similar for the test database, with one extra step:

```
yarn db-init:test;
yarn sequelize:test db:migrate;
yarn sequelize:test db:seed:all;
yarn workspace server db-import-tests:test;
yarn workspace server db-populate-sample-data:test;
```

### Inspecting the database

To connect to the Postgres table locally:
    ```
    yarn run dotenv -e config/dev.env psql
    ```

## Application development: modifications to the schema

1. Write a migration. Migrations files should be saved to `server/migrations/`. To make a migration file with the appropriate file name, run:
    ```
    yarn sequelize-cli migration:generate --name <name>
    ```
2. Write a seed file to add data to a table if appropriate. Seed files should be saved to `server/seeder/`. To make a seeder file with the appropriate file name, run:
    ```
    yarn sequelize-cli seed:generate --name <name>
    ```
3. Modify the appropriate models under `server/models/` so that the model accurate represents the database.
