const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { v4: uuidv4 } = require('uuid');


// test for endpoints
describe('File API Endpoints', () => {
    const testFilePath = path.join(__dirname, 'testfile.txt');
    const folderPath = process.env.FOLDER;
  
    beforeAll(() => {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      fs.writeFileSync(testFilePath, 'Test file content');
    });
  
    afterAll(() => {
      fs.unlinkSync(testFilePath);
    });
  
    let publicKey, privateKey;
  
    it('should upload a file', async () => {
      const res = await request(app)
        .post('/files')
        .attach('file', testFilePath);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('publicKey');
      expect(res.body).toHaveProperty('privateKey');
  
      publicKey = res.body.publicKey;
      privateKey = res.body.privateKey;
    });
  
    it('should download a file by publicKey', async () => {
      const res = await request(app).get(`/files/${publicKey}`);
  
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('content-type');
    });
  
    it('should delete a file by privateKey', async () => {
      const res = await request(app).delete(`/files/${privateKey}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'File removed successfully');
    });
  
    it('should return 404 for a non-existent file', async () => {
      const res = await request(app).get(`/files/${uuidv4()}`);
  
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'File not found');
    });
  
    it('should return 500 for invalid privateKey', async () => {
      const res = await request(app).delete(`/files/${uuidv4()}`);
  
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'File removal failed');
    });
  });
  