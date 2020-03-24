# Database setup

## Local database setup

### Dependencies
* Flyway
  * Mac Install:
  ```
  brew install flyway
  ```

### Initialize the database
```
yarn db-init:dev 
```

## Run database migrations
Every time a new migration file is added, Flyway must be run again to apply the migration.

### Dev
```
yarn db-migrate:dev
```


