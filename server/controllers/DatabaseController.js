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

const removeDatabaseTablesAndFunctions = async res => {
  // Database connection configuration
  const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD
  });

  try {
    // Init database connection
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

    // Build and execute DROP TABLE commands
    const tableNames = tablesResult.rows
      .filter(row => row.tablename !== 'session')
      .map(row => `"${row.tablename}"`);
    if (tableNames.length === 0) {
      res.write('No tables found to drop.\n');
    } else {
      res.write(`Dropping tables: ${tableNames.join(', ')}\n`);
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
      res.write(`Executing: ${dropStatement}\n`);
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
  const { dumpOutputDirectory, dumpFileName } = req.body;

  if (dumpFileName && !dumpFileName.includes('.sql'))
    return res.status(400).send("Provided file name does not include '.sql'");

  const OUTPUT_DIR = dumpOutputDirectory || path.join(os.homedir(), 'db_dumps');
  const DUMP_FILE = path.join(
    OUTPUT_DIR,
    dumpFileName ||
      `${process.env.ENVIRONMENT}_dump_${dates.convertDateToString(
        new Date(),
        'YYYYMMDD_HHmmss'
      )}.sql`
  );

  try {
    // pg_dump command
    const pgDumpCommand = `PGPASSWORD=${DB_PASSWORD} pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} --exclude-table=session > ${DUMP_FILE}`;

    // Execute the command
    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        return res
          .status(400)
          .send(`Error executing pg_dump: ${sanitizeError(error.message)}`);
      }
      if (stderr) {
        return res
          .status(400)
          .send(`pg_dump stderr:: ${sanitizeError(stderr)}`);
      }
      return res
        .status(200)
        .send(`Database dump completed successfully: ${DUMP_FILE}`);
    });
  } catch (error) {
    return res
      .status(400)
      .send(`Unable to dump database: ${sanitizeError(error.message)}`);
  }
};

const restorePostgresDatabase = async (req, res) => {
  // Prevent unintentionally dropping or restoring database tables if ran on
  // production unless manually done
  if (process.env.ENVIRONMENT === 'production') {
    return res.status(405).send('This request is not permitted');
  }

  const { pathToFile } = req.body;
  if (!pathToFile)
    return res.status(400).send("'pathToFile' is missing. Please provide.");

  // Purge the database's tables and functions to make restoring with the
  // pg import easier
  await removeDatabaseTablesAndFunctions(res);

  try {
    // delete the tables currently in the db
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

// Function to clean up the dump folder
const cleanFolder = (req, res) => {
  const { dumpOutputDirectory, maxFiles } = req.body;

  if (maxFiles) {
    if (!isNaN(maxFiles) && Number.isInteger(Number(maxFiles))) {
      // continue
    } else {
      return res.status(400).send('Unable to parse maxFiles value provided');
    }
  } else {
    // continue
  }

  // Default the output directory to ~/db_dumps if no path provided
  const OUTPUT_DIR = dumpOutputDirectory || path.join(os.homedir(), 'db_dumps');
  // Default the number of max files to 28 if no value provided
  const MAX_FILES = Number(maxFiles) || 28;

  try {
    // Read all files in the folder
    const files = fs.readdirSync(OUTPUT_DIR).map(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      return {
        name: file,
        path: filePath,
        time: fs.statSync(filePath).mtime.getTime() // Get last modified time
      };
    });

    // Sort files by modification time (oldest first)
    files.sort((a, b) => a.time - b.time);

    // Delete files if there are more than maxFiles
    if (files.length > MAX_FILES) {
      const removedFiles = [];

      const filesToDelete = files.slice(0, files.length - MAX_FILES);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path); // Delete the file
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

module.exports = {
  dumpPostgresDatabase,
  restorePostgresDatabase,
  cleanFolder
};
