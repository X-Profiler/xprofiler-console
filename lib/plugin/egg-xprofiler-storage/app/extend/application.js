'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

module.exports = {
  get storage() {
    const { config: { storagePath }, logger } = this;

    return {
      async saveFile(fileName, stream) {
        const filePath = path.join(storagePath, fileName);
        try {
          // buffer
          if (stream instanceof Buffer) {
            await writeFile(filePath, stream);
            return;
          }

          // stream
          const writable = fs.createWriteStream(filePath);
          await new Promise((resolve, reject) => {
            stream.pipe(writable);
            stream.on('end', resolve);
            setTimeout(() => reject(new Error('save file timeout')), 2 * 60 * 1000);
          });
        } catch (err) {
          logger.error(`save file failed: ${err}`);
          if (!await exists(filePath)) {
            return;
          }
          await unlink(filePath);
        }
      },

      async deleteFile(fileName) {
        try {
          const filePath = path.join(storagePath, fileName);
          await unlink(filePath);
        } catch (err) {
          logger.error(`delete file failed: ${err}`);
        }
      },

      downloadFile(fileName) {
        const filePath = path.join(storagePath, fileName);
        return fs.createReadStream(filePath);
      },
    };
  },
};
