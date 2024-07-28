
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const cleanupOldFiles = () => {
  const folderPath = process.env.FOLDER;
  const metadataFilePath = path.join(folderPath, 'metadata.json');
  const cleanupPeriod = parseInt(process.env.CLEANUP_PERIOD_MINUTES) * 60 * 1000;

  // Schedule the cleanup task to run every minute
  cron.schedule('* * * * *', () => {
    console.log('Running cleanup task...');
    if (fs.existsSync(metadataFilePath)) {
      const metadataList = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
      const currentTime = Date.now();

      const updatedMetadataList = metadataList.filter(meta => {
        const filePath = path.join(folderPath, meta.filePath);
        if (!fs.existsSync(filePath)) {
          return false;
        }

        const fileStats = fs.statSync(filePath);
        const lastModifiedTime = new Date(fileStats.mtime).getTime();
        const inactiveTime = currentTime - lastModifiedTime;

        if (inactiveTime > cleanupPeriod) {
          console.log(`Deleting file: ${filePath}`);
          fs.unlinkSync(filePath);
          return false;
        }
        return true;
      });

      fs.writeFileSync(metadataFilePath, JSON.stringify(updatedMetadataList, null, 2));
    }
  });
};

module.exports = { cleanupOldFiles };
