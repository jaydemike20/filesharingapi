const fs = require('fs');
const path = require('path');
const { uploadFile, downloadFileByPublicKey, deleteFileByPrivateKey } = require('../src/controllers/fileController');

// Mock the fileService methods
jest.mock('../src/components/fileService', () => ({
    uploadFile: jest.fn(),
    getFileByPublicKey: jest.fn(),
    deleteFileByPrivateKey: jest.fn(),
}));

const fileService = require('../src/components/fileService');

// creating a test for controllers
describe('fileController', () => {
    const req = {};
    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        sendFile: jest.fn(),
    };

    describe('uploadFile', () => {
        it('should return error if no file is uploaded', () => {
            req.file = null; // Simulate no file in the request

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
        });

        it('should upload file and return file data', () => {
            req.file = { filename: 'testfile.txt', buffer: Buffer.from('test content') }; // Simulated file upload
            const mockResponse = { id: '1', filePath: 'path/to/file', publicKey: 'public-key', privateKey: 'private-key' };

            fileService.uploadFile.mockReturnValue(mockResponse); // Mock response

            uploadFile(req, res);

            expect(fileService.uploadFile).toHaveBeenCalledWith(req.file);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it('should handle errors during file upload', () => {
            req.file = { filename: 'testfile.txt', buffer: Buffer.from('test content') };
            fileService.uploadFile.mockImplementation(() => { throw new Error('Upload failed'); }); // Simulate an error

            uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'File upload failed' });
        });
    });

    describe('downloadFileByPublicKey', () => {
        it('should send file if found', () => {
            req.params = { publicKey: 'public-key' };
            const mockFilePath = 'path/to/file';
            fileService.getFileByPublicKey.mockReturnValue(mockFilePath); // Mock file path retrieval
            fs.existsSync = jest.fn().mockReturnValue(true); // Mock file existence

            downloadFileByPublicKey(req, res);

            expect(fileService.getFileByPublicKey).toHaveBeenCalledWith(req.params.publicKey);
            expect(res.sendFile).toHaveBeenCalledWith(path.resolve(mockFilePath));
        });

        it('should return error if file not found', () => {
            req.params = { publicKey: 'invalid-key' };
            fileService.getFileByPublicKey.mockReturnValue(null); // Mock no file found
            fs.existsSync = jest.fn().mockReturnValue(false); // Mock non-existence

            downloadFileByPublicKey(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'File not found' });
        });
    });

    describe('deleteFileByPrivateKey', () => {
        it('should delete file and return success message', () => {
            req.params = { privateKey: 'private-key' };

            deleteFileByPrivateKey(req, res);

            expect(fileService.deleteFileByPrivateKey).toHaveBeenCalledWith(req.params.privateKey);
            expect(res.json).toHaveBeenCalledWith({ message: 'File removed successfully' });
        });

        it('should handle errors during file deletion', () => {
            req.params = { privateKey: 'invalid-private-key' };
            fileService.deleteFileByPrivateKey.mockImplementation(() => { throw new Error('Deletion failed'); }); // Simulate an error

            deleteFileByPrivateKey(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'File removal failed' });
        });
    });
});
