const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('./controllers/fileController');
const { cleanupOldFiles } = require('./utils/cleanup');
require('dotenv').config();

const {downloadLimiter, uploadLimiter } = require('./middlewares/rateLimiter');



const app = express();
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))

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



// Routes
app.post('/files', uploadLimiter, upload.single('file'), fileController.uploadFile);
app.get('/files/:publicKey', downloadLimiter, fileController.downloadFileByPublicKey);
app.delete('/files/:privateKey', fileController.deleteFileByPrivateKey);





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  cleanupOldFiles();

});

