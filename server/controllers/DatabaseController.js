const fs = require('fs');
const path = require('path');
const os = require('os');
const { Client } = require('pg');
const { exec } = require('child_process');
const { dates } = require('shared');

// Database configuration
const DB_NAME = process.env.PGDATABASE;
const DB_USER = process.env.PGUSER;
const DB_PASSWORD = process.env.PGPASSWORD;
const DB_HOST = process.env.PGHOST;

// To avoid unintentionally exposing environment variables in error messages
const sanitizeError = message => {
  const redacted = '#redacted#';

  const dbNameRegex = new RegExp(DB_NAME, 'g');
  const dbUserRegex = new RegExp(DB_USER, 'g');
  const dbPasswordRegex = new RegExp(DB_PASSWORD, 'g');
  const dbHostRegex = new RegExp(DB_HOST, 'g');

  return message
    .replace(dbNameRegex, redacted)
    .replace(dbUserRegex, redacted)
    .replace(dbPasswordRegex, redacted)
    .replace(dbHostRegex, redacted);
};

const dumpPostgresDatabaseToFile = (dumpFileName = null) => {
  const OUTPUT_DIR = path.join(os.homedir(), 'db_dumps');
  const DUMP_FILE = path.join(
    OUTPUT_DIR,
    dumpFileName ||
      `${process.env.ENVIRONMENT}_dump_${dates.convertDateToString(
        new Date(),
        'YYYYMMDD_HHmmss'
      )}.sql`
  );

  return new Promise((resolve, reject) => {
    try {
      // pg_dump command that ignores the table "session" because it causes unnecessary conflicts when being used to restore a db
      const pgDumpCommand = `PGPASSWORD=${DB_PASSWORD} pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} --exclude-table=session > ${DUMP_FILE}`;
      exec(pgDumpCommand, (error, stdout, stderr) => {
        if (error) {
          return reject(
            new Error(
              `Error executing pg_dump: ${sanitizeError(error.message)}`
            )
          );
        }
        if (stderr) {
          return reject(new Error(`pg_dump stderr: ${sanitizeError(stderr)}`));
        }
        return resolve(`Database dump completed successfully: ${DUMP_FILE}`);
      });
    } catch (error) {
      return reject(
        new Error(`Unable to dump database: ${sanitizeError(error.message)}`)
      );
    }
  });
};

const removeDatabaseTablesAndFunctions = async res => {
  const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD
  });

  try {
    await client.connect();
    res.write('Connected to the database.\n');

    // [Tables DROP // START]
    // Get all tables in the public schema
    const tablesQuery = `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `;
    const tablesResult = await client.query(tablesQuery);

    // Execute DROP TABLE commands
    const tableNames = tablesResult.rows
      // Ignore 'session' because dropping it may cause unnecessary conflicts
      // when restoring
      .filter(row => row.tablename !== 'session')
      .map(row => `"${row.tablename}"`);
    if (tableNames.length === 0) {
      res.write('No tables found to drop.\n');
    } else {
      // eslint-disable-next-line no-console
      console.info(`Dropping tables: ${tableNames.join(', ')}`);
      await client.query(`DROP TABLE ${tableNames.join(', ')} CASCADE;`);
      res.write('All tables have been dropped successfully.\n');
    }
    // [Tables DROP // END]

    // [Functions DROP // START]
    // Get all user-defined functions
    const functionsQuery = `
      SELECT 'DROP FUNCTION IF EXISTS ' || n.nspname || '.' || p.proname || '(' ||
             pg_get_function_identity_arguments(p.oid) || ');' AS drop_statement
      FROM pg_proc p
             JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema');
    `;

    const functionsResult = await client.query(functionsQuery);
    const dropStatements = functionsResult.rows.map(row => row.drop_statement);

    // Execute each DROP FUNCTION statement
    for (const dropStatement of dropStatements) {
      // eslint-disable-next-line no-console
      console.info(`Executing: ${dropStatement}`);
      await client.query(dropStatement);
    }
    res.write('All functions removed successfully!\n');
    // [Functions DROP // END]
  } catch (error) {
    res.write(
      `Error removing tables or functions: ${sanitizeError(error.message)}\n`
    );
  } finally {
    await client.end();
    res.write('Disconnected from the database.\n');
  }
};

const dumpPostgresDatabase = async (req, res) => {
  const { dumpFileName } = req.body;

  if (dumpFileName && path.extname(dumpFileName) !== '.sql')
    return res.status(400).send("Provided file name does not include '.sql'");

  try {
    const result = await dumpPostgresDatabaseToFile();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const restorePostgresDatabase = async (req, res) => {
  // Prevent unintentionally dropping or restoring database tables if ran on
  // production unless manually done
  if (
    process.env.ENVIRONMENT === 'production' ||
    process.env.API_SERVER === 'https://aria-at.w3.org' ||
    req.hostname.includes('aria-at.w3.org')
  ) {
    return res.status(405).send('This request is not permitted');
  }

  const { pathToFile } = req.body;
  if (!pathToFile)
    return res.status(400).send("'pathToFile' is missing. Please provide.");

  if (path.extname(pathToFile) !== '.sql')
    return res
      .status(400)
      .send("The provided path is not in the expected '.sql' format.");

  // Backup current db before running restore in case there is a need to revert
  const dumpFileName = `${
    process.env.ENVIRONMENT
  }_dump_${dates.convertDateToString(
    new Date(),
    'YYYYMMDD_HHmmss'
  )}_before_restore.sql`;

  try {
    const result = await dumpPostgresDatabaseToFile(dumpFileName);
    res.status(200).write(`${result}\n\n`);
  } catch (error) {
    return res
      .status(400)
      .send(
        `Unable to continue restore. Failed to backup current data:\n${error.message}`
      );
  }

  // Purge the database's tables and functions to make restoring with the
  // pg import easier
  await removeDatabaseTablesAndFunctions(res);

  try {
    const pgImportCommand = `PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} -f ${pathToFile}`;

    // Execute the command
    exec(pgImportCommand, (error, stdout, stderr) => {
      if (error) {
        res
          .status(400)
          .write(`Error executing pg import: ${sanitizeError(error.message)}`);
      }
      if (stderr) {
        res.status(400).write(`pg import stderr:: ${sanitizeError(stderr)}`);
      }
      res.status(200).write(`Database import completed successfully`);
      return res.end();
    });
  } catch (error) {
    res
      .status(400)
      .write(`Unable to import database: ${sanitizeError(error.message)}`);
    return res.end();
  }
};

const cleanFolder = (req, res) => {
  const { maxFiles } = req.body;

  if (maxFiles) {
    if (!isNaN(maxFiles) && Number.isInteger(Number(maxFiles))) {
      // continue
    } else {
      return res
        .status(400)
        .send("Unable to parse the 'maxFiles' value provided.");
    }
  } else {
    // continue
  }

  const CLEAN_DIR = path.join(os.homedir(), 'db_dumps');
  // Default the number of max files to 28 if no value provided
  const MAX_FILES = Number(maxFiles) || 28;

  if (
    process.env.ENVIRONMENT === 'production' ||
    process.env.API_SERVER === 'https://aria-at.w3.org' ||
    req.hostname.includes('aria-at.w3.org')
  ) {
    if (!CLEAN_DIR.includes('/home/aria-bot/db_dumps')) {
      return res
        .status(500)
        .send("Please ensure the 'db_dumps' folder is properly set.");
    }
  }

  try {
    // Read all files in the folder
    const files = fs.readdirSync(CLEAN_DIR).map(file => {
      const filePath = path.join(CLEAN_DIR, file);
      return {
        name: file,
        path: filePath,
        time: fs.statSync(filePath).mtime.getTime()
      };
    });

    files.sort((a, b) => a.time - b.time);

    // Delete files if there are more than maxFiles
    if (files.length > MAX_FILES) {
      const removedFiles = [];

      const filesToDelete = files.slice(0, files.length - MAX_FILES);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        removedFiles.push(file);
      });
      return res
        .status(200)
        .send(
          `Removed the following files:\n${removedFiles
            .map(({ name }, index) => `#${index + 1}) ${name}`)
            .join('\n')}`
        );
    } else {
      return res
        .status(200)
        .send('No files to delete. Folder is within the limit.');
    }
  } catch (error) {
    return res.status(400).send(`Error cleaning folder: ${error.message}`);
  }
};

const resetPostgresDatabase = async (req, res) => {
  if (process.env.ENVIRONMENT === 'production') {
    return res.status(405).send('This request is not permitted in production.');
  }

  try {
    const BUILD_DUMP_DIR =
      process.env.BUILD_DB_DUMP_DIR || path.join(os.homedir(), 'db_dumps');
    const BUILD_DUMP_FILE = path.join(BUILD_DUMP_DIR, 'build_dump.sql');

    if (!fs.existsSync(BUILD_DUMP_FILE)) {
      return res.status(404).send('No build dump file found');
    }

    req.body.pathToFile = BUILD_DUMP_FILE;
    await restorePostgresDatabase(req, res);
  } catch (error) {
    return res.status(500).send(sanitizeError(error.message));
  }
};

module.exports = {
  dumpPostgresDatabase,
  restorePostgresDatabase,
  cleanFolder,
  resetPostgresDatabase
};
