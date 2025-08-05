const path = require('path');
const fse = require('fs-extra');
const yauzl = require('yauzl');

/**
 * Extracts a zip file to a target directory.
 * @param {string} zipPath - Path to the zip file.
 * @param {string} targetPath - Path to extract to.
 * @returns {Promise<void>}
 */
const extractZipFile = (zipPath, targetPath) => {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.on('close', () => resolve());
      zipfile.on('error', reject);

      zipfile.on('entry', entry => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          zipfile.readEntry();
        } else {
          // File entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const filePath = path.join(targetPath, entry.fileName);
            const dirPath = path.dirname(filePath);

            // Ensure directory exists
            fse.mkdirSync(dirPath, { recursive: true });

            const writeStream = fse.createWriteStream(filePath);
            readStream.pipe(writeStream);

            writeStream.on('close', () => {
              zipfile.readEntry();
            });

            writeStream.on('error', reject);
          });
        }
      });

      zipfile.readEntry();
    });
  });
};

module.exports = extractZipFile;
