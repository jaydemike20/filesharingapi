
const fs = require('fs');
const path = require('path');
const { uploadFile, getFileByPublicKey, deleteFileByPrivateKey } = require('../src/components/fileService');

// Mock fs module
jest.mock('fs');

describe('fileService', () => {
    const mockFile = {
        filename: 'testfile.txt',
        buffer: Buffer.from('test content')
    };

    const folderPath = process.env.FOLDER || './testFolder'; // Default path for testing
    const metadataFilePath = path.join(folderPath, 'metadata.json');

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
        process.env.FOLDER = folderPath; // Set environment variable for testing
    });

    describe('uploadFile', () => {
        it('should upload file and save metadata', () => {
            // Mock fs.existsSync to return false (file does not exist yet)
            fs.existsSync.mockReturnValue(false);
            fs.readFileSync.mockReturnValue(JSON.stringify([])); // Return empty array when reading
            fs.writeFileSync.mockImplementation(() => {}); // Mock write function

            const metadata = uploadFile(mockFile);

            expect(fs.writeFileSync).toHaveBeenCalledWith(metadataFilePath, JSON.stringify([metadata], null, 2));
            expect(metadata).toHaveProperty('id');
            expect(metadata).toHaveProperty('filePath', path.join(folderPath, mockFile.filename));
            expect(metadata).toHaveProperty('publicKey');
            expect(metadata).toHaveProperty('privateKey');
        });
    });

    describe('getFileByPublicKey', () => {
        it('should return the correct file path by public key', () => {
            const metadataList = [
                { publicKey: 'public-key-1', filePath: 'path/to/file1.txt' },
                { publicKey: 'public-key-2', filePath: 'path/to/file2.txt' }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(metadataList)); // Mock reading metadata file

            const filePath = getFileByPublicKey('public-key-1');

            expect(filePath).toBe('path/to/file1.txt');
        });

        it('should return null if public key not found', () => {
            const metadataList = [
                { publicKey: 'public-key-1', filePath: 'path/to/file1.txt' }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(metadataList));

            const filePath = getFileByPublicKey('invalid-key');

            expect(filePath).toBeNull();
        });
    });

    describe('deleteFileByPrivateKey', () => {
        it('should delete file metadata and file from the system', () => {
            const metadataList = [
                { privateKey: 'private-key-1', filePath: 'path/to/file1.txt' },
                { privateKey: 'private-key-2', filePath: 'path/to/file2.txt' }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(metadataList));
            fs.writeFileSync.mockImplementation(() => {}); // Mock write function
            fs.unlinkSync.mockImplementation(() => {}); // Mock unlink function

            deleteFileByPrivateKey('private-key-1');

            expect(fs.writeFileSync).toHaveBeenCalledWith(metadataFilePath, JSON.stringify([{ privateKey: 'private-key-2', filePath: 'path/to/file2.txt' }], null, 2));
            expect(fs.unlinkSync).toHaveBeenCalledWith('path/to/file1.txt');
        });

        it('should throw an error if private key is invalid', () => {
            const metadataList = [
                { privateKey: 'private-key-1', filePath: 'path/to/file1.txt' }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(metadataList));

            expect(() => deleteFileByPrivateKey('invalid-private-key')).toThrow('Invalid privateKey');
        });
    });
});


