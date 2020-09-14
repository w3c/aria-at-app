# Local Database

The database migrations are managed by [Sequelize](https://sequelize.org/). To read and understand the schema, see the sequelize models that represent the data in `server/models`. Each model represents a table in the database.

## Setting up a local database for development

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

### Inspecting the database

To connect to the Postgres table locally:
    ```
    yarn run dotenv -e config/dev.env psql
    ```

## Application development: modifications to the schema

1. Write a migration. Migrations files should be saved to `server/migrations/`. To make a migration file with the appropraite file name, run:
    ```
    yarn sequelize-cli migration:generate <name>
    ```
2. Write a seed file to add data to a table if appropriate. Seed files should be saved to `server/seeder/`. To make a seeder file with the appropraite file name, run:
    ```
    yarn sequelize-cli seed:generate <name>
    ```
3. Modify the appropriate models under `server/models/` so that the model accurate represents the database.
