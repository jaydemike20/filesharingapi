const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { cleanupOldFiles } = require('../src/utils/cleanup');

jest.mock('fs');
jest.mock('node-cron');

// testing cleanup inactivty files
describe('cleanupOldFiles', () => {
  const folderPath = '/mock/folder';
  const metadataFilePath = path.join(folderPath, 'metadata.json');
  const cleanupPeriodMinutes = 10;
  const cleanupPeriodMilliseconds = cleanupPeriodMinutes * 60 * 1000;

  beforeAll(() => {
    process.env.FOLDER = folderPath;
    process.env.CLEANUP_PERIOD_MINUTES = cleanupPeriodMinutes.toString();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a cleanup task to run every minute', () => {
    const scheduledFunction = jest.fn();
    cron.schedule.mockImplementation((_, fn) => {
      scheduledFunction.mockImplementation(fn);
    });

    cleanupOldFiles();

    // Trigger the scheduled function manually
    scheduledFunction();

    expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));
  });

  it('should delete files that are older than the cleanup period', () => {
    const mockMetadata = [
      { filePath: 'file1.txt' },
      { filePath: 'file2.txt' },
    ];
    const currentTime = Date.now();

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockMetadata));
    fs.statSync.mockImplementation(filePath => ({
      mtime: new Date(currentTime - cleanupPeriodMilliseconds - 1),
    }));
    fs.unlinkSync = jest.fn();
    fs.writeFileSync = jest.fn();

    cleanupOldFiles();

    // Trigger the scheduled function manually
    const scheduledFunction = cron.schedule.mock.calls[0][1];
    scheduledFunction();

    expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(folderPath, 'file1.txt'));
    expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(folderPath, 'file2.txt'));
    expect(fs.writeFileSync).toHaveBeenCalledWith(metadataFilePath, JSON.stringify([], null, 2));
  });

  it('should not delete files that are within the cleanup period', () => {
    const mockMetadata = [
      { filePath: 'file1.txt' },
      { filePath: 'file2.txt' },
    ];
    const currentTime = Date.now();

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockMetadata));
    fs.statSync.mockImplementation(filePath => ({
      mtime: new Date(currentTime - cleanupPeriodMilliseconds + 1),
    }));
    fs.unlinkSync = jest.fn();
    fs.writeFileSync = jest.fn();

    cleanupOldFiles();

    // Trigger the scheduled function manually
    const scheduledFunction = cron.schedule.mock.calls[0][1];
    scheduledFunction();

    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(metadataFilePath, JSON.stringify(mockMetadata, null, 2));
  });

  it('should not run cleanup if metadata file does not exist', () => {
    fs.existsSync.mockReturnValue(false);

    cleanupOldFiles();

    // Trigger the scheduled function manually
    const scheduledFunction = cron.schedule.mock.calls[0][1];
    scheduledFunction();

    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
