const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('./controllers/fileController');
const rateLimiter = require('./middlewares/rateLimiter');
const { cleanupOldFiles } = require('./utils/cleanup');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Apply rate limiter middleware
app.use(rateLimiter);

// Routes
app.post('/files', upload.single('file'), fileController.uploadFile);
app.get('/files/:publicKey', fileController.downloadFileByPublicKey);
app.delete('/files/:privateKey', fileController.deleteFileByPrivateKey);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Schedule file cleanup
cleanupOldFiles();
