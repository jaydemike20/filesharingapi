const express = require('express');
const request = require('supertest');
const { downloadLimiter, uploadLimiter } = require('../src/middlewares/rateLimiter'); // Adjust path if needed


// test for daily usage limiter
describe('Rate Limiter Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post('/upload', uploadLimiter, (req, res) => res.status(200).send('Upload OK'));
    app.get('/download', downloadLimiter, (req, res) => res.status(200).send('Download OK'));
  });

  describe('uploadLimiter', () => {
    it('should allow requests within the limit', async () => {
      const limit = process.env.UPLOAD_LIMIT || 1;

      for (let i = 0; i < limit; i++) {
        const response = await request(app).post('/upload');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Upload OK');
      }
    });

    it('should deny requests exceeding the limit', async () => {
      process.env.UPLOAD_LIMIT = 0; // Set limit to 0 to trigger rate limit

      const response = await request(app).post('/upload');
      expect(response.status).toBe(429);
      expect(response.text).toBe('Too many requests');
    });
  });

  describe('downloadLimiter', () => {
    it('should allow requests within the limit', async () => {
      const limit = process.env.DOWNLOAD_LIMIT || 2;

      for (let i = 0; i < limit; i++) {
        const response = await request(app).get('/download');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Download OK');
      }
    });

    it('should deny requests exceeding the limit', async () => {
      process.env.DOWNLOAD_LIMIT = 0; // Set limit to 0 to trigger rate limit

      const response = await request(app).get('/download');
      expect(response.status).toBe(429);
      expect(response.text).toBe('Too many requests');
    });
  });
});
