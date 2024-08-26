const { exec } = require('child_process');
const path = require('path');

/**
 * Used to dump the database in case a significantly destructive behavior is to
 * be done. This should make running a down migration possible if required.
 *
 * @returns {Promise<void>}
 */
const dumpDatabase = async () => {
  try {
    const dumpFilePath = path.resolve(
      `${__dirname}/../dumps/dumpDatabase_${new Date().getTime()}.sql`
    );
    await exec(`pg_dump ${process.env.PGDATABASE} --inserts > ${dumpFilePath}`);
  } catch (err) {
    throw new Error(`Error dumping ${process.env.PGDATABASE}:${err.message}`);
  }
};

module.exports = dumpDatabase;
