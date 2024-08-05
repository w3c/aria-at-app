const { exec } = require('child_process');
const path = require('path');

/**
 * Used to dump a table in case a significantly destructive behavior is to be
 * done. This should make running a down migration possible if required.
 *
 * @param tableName
 * @returns {Promise<void>}
 */
const dumpTable = async tableName => {
  try {
    const dumpFilePath = path.resolve(
      `${__dirname}/../dumps/dumpTable_${tableName}_${new Date().getTime()}.sql`
    );

    await exec(
      `pg_dump -t '"${tableName}"' ${process.env.PGDATABASE} --inserts > ${dumpFilePath}`
    );
  } catch (err) {
    console.error(`Error dumping ${tableName}:${err}`);
  }
};

module.exports = dumpTable;
