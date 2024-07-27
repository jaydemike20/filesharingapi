const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


// generate file metadata.json
const getFileMetaData = (filename) => {
    const id = uuidv4();             // basic id
    const publicKey = uuidv4();     // for downloading existing file
    const privateKey = uuidv4();   // for deleting file 

    // this will return every time we upload a file
    return {
        id,
        filePath: path.join(process.env.FOLDER, filename),
        publicKey,
        privateKey
    }
}

// api/files/ - POST METHOD
const uploadFile = (file) => {
    const metadata = getFileMetaData(file.filename);
    const metadataFilePath = path.join(process.env.FOLDER, 'metadata.json');
    const metadataList = fs.existsSync(metadataFilePath)
    ? JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'))
    : [];
    metadataList.push(metadata);
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadataList, null, 2));
    return metadata;
};

// api/files/:publicKey - GET METHOD
const getFileByPublicKey = (publicKey) => {
    const metadataFilePath = path.join(process.env.FOLDER, 'metadata.json');
    const metadataList = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
    const fileMetadata = metadataList.find(meta => meta.publicKey === publicKey);
    return fileMetadata ? fileMetadata.filePath : null;
};


// api/files/:privateKey - DELETE METHOD
const deleteFileByPrivateKey = (privateKey) => {
  const metadataFilePath = path.join(process.env.FOLDER, 'metadata.json');
  let metadataList = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
  const fileMetadata = metadataList.find(meta => meta.privateKey === privateKey);
  if (fileMetadata) {
    // Remove metadata entry
    metadataList = metadataList.filter(meta => meta.privateKey !== privateKey);
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadataList, null, 2));
    // Delete the file
    fs.unlinkSync(fileMetadata.filePath);
  } else {
    throw new Error('Invalid privateKey');
  }
};

module.exports = { uploadFile, getFileByPublicKey, deleteFileByPrivateKey }

