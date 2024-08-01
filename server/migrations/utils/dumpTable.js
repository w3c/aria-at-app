const { exec } = require('child_process');

/**
 * Used to dump a table in case a significantly destructive behavior is to be
 * done. This should make running a down migration possible if required.
 *
 * Ideally, also add "server/migrations/dumps/<tableName>" to <root>/.gitignore
 * @param tableName
 * @returns {Promise<void>}
 */
const dumpTable = async tableName => {
  try {
    await exec(
      `pg_dump -t '"${tableName}"' ${
        process.env.PGDATABASE
      } > ${__dirname}/dumps/pg_dump_${tableName}_${new Date().getTime()}.sql`
    );
  } catch (err) {
    console.error(`Error dumping ${tableName}:${err}`);
  }
};

module.exports = dumpTable;
