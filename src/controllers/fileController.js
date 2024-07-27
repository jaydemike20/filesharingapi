
// const fs = require('fs'); 
// const path = require('path');
// const fileService = require('../components/fileService');

// // Upload a file
// const uploadFile = (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   try {
//     const fileData = fileService.uploadFile(req.file);
//     res.json(fileData);
//   } catch (error) {
//     res.status(500).json({ error: 'File upload failed' });
//   }
// };

// // Download a file by publicKey
// const downloadFileByPublicKey = (req, res) => {
//   const filePath = fileService.getFileByPublicKey(req.params.publicKey);
//   if (filePath && fs.existsSync(filePath)) {
//     res.sendFile(path.resolve(filePath));
//   } else {
//     res.status(404).json({ error: 'File not found' });
//   }
  
// };

// // Delete a file by privateKey
// const deleteFileByPrivateKey = (req, res) => {
//   try {
//     fileService.deleteFileByPrivateKey(req.params.privateKey);
//     res.json({ message: 'File removed successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'File removal failed' });
//   }
// };

// module.exports = { uploadFile, downloadFileByPublicKey, deleteFileByPrivateKey };

const fs = require('fs'); 
const path = require('path');
const fileService = require('../components/fileService');
const mime = require('mime-types'); // Ensure mime-types is properly imported

// Upload a file
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const fileData = fileService.uploadFile(req.file);
    res.json(fileData);
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
};

// Download a file by publicKey
const downloadFileByPublicKey = (req, res) => {
  try {
    const filePath = fileService.getFileByPublicKey(req.params.publicKey);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filename = path.basename(filePath);
    const mimetype = mime.lookup(filePath) || 'application/octet-stream'; // Default to octet-stream if MIME type not found

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', mimetype);

    const filestream = fs.createReadStream(filePath);
    filestream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'File retrieval failed', details: error.message });
  }
};

// Delete a file by privateKey
const deleteFileByPrivateKey = (req, res) => {
  try {
    fileService.deleteFileByPrivateKey(req.params.privateKey);
    res.json({ message: 'File removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'File removal failed' });
  }
};

module.exports = { uploadFile, downloadFileByPublicKey, deleteFileByPrivateKey };
