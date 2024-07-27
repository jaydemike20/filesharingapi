const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const cleanupOldFiles = () => {
  cron.schedule(`0 0 * * *`, () => {
    // Run daily at midnight
    const folderPath = process.env.FOLDER;

    fs.readdir(folderPath, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        fs.stat(filePath, (err, stats) => {
          if (err) throw err;

          const now = Date.now();
          const fileAge = now - stats.mtimeMs;
          const maxAge = parseInt(process.env.CLEANUP_INTERVAL) * 60 * 60 * 1000; // Convert to milliseconds

          if (fileAge > maxAge) {
            fs.unlink(filePath, (err) => {
              if (err) throw err;
              console.log(`Deleted ${filePath}`);
            });
          }
        });
      });
    });
  });
};

module.exports = { cleanupOldFiles };
