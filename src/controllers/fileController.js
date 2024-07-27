
const fs = require('fs'); 
const path = require('path');
const fileService = require('../components/fileService');

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
  const filePath = fileService.getFileByPublicKey(req.params.publicKey);
  if (filePath && fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
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

