import { workspaceService } from '@services/workspace.service';
import { fileRepository, folderRepository } from '@repositories/index';
import { s3Helpers } from '@config/index';

// Mock dependencies
jest.mock('@repositories/index');
jest.mock('@config/index');
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));
jest.mock('@config/database.config', () => ({
  sequelize: {
    authenticate: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  },
}));
jest.mock('@models/index', () => ({
  File: {
    findByPk: jest.fn()
  },
  Folder: {
    findByPk: jest.fn()
  }
}));

describe('Workspace Service - File Download', () => {
  const mockFile = {
    id: 'file-123',
    originalName: 'test.pdf',
    fileName: 'uuid.pdf',
    folderId: 'folder-123',
    s3Path: 'clients/ABC/folder/uuid.pdf',
    folder: {
      id: 'folder-123',
      clientId: 'client-123'
    }
  };

  const mockFolder = {
    id: 'folder-123',
    clientId: 'client-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate download URL successfully', async () => {
    (fileRepository.findById as jest.Mock).mockResolvedValue(mockFile);
    (s3Helpers.getSignedDownloadUrl as jest.Mock).mockResolvedValue('https://s3.url/test.pdf');

    const result = await workspaceService.getFileDownloadUrl('file-123', 'user-123', 'admin');

    expect(result.url).toBe('https://s3.url/test.pdf');
    expect(result.fileName).toBe('test.pdf');
  });

  it('should fallback to manual folder lookup if folder association is missing', async () => {
    const fileWithoutFolder = { ...mockFile, folder: null };
    (fileRepository.findById as jest.Mock).mockResolvedValue(fileWithoutFolder);
    (folderRepository.findById as jest.Mock).mockResolvedValue(mockFolder);
    (s3Helpers.getSignedDownloadUrl as jest.Mock).mockResolvedValue('https://s3.url/test.pdf');

    const result = await workspaceService.getFileDownloadUrl('file-123', 'user-123', 'admin');

    expect(folderRepository.findById).toHaveBeenCalledWith('folder-123');
    expect(result.url).toBe('https://s3.url/test.pdf');
  });

  it('should throw error if folder is eventually not found', async () => {
    const fileWithoutFolder = { ...mockFile, folder: null };
    (fileRepository.findById as jest.Mock).mockResolvedValue(fileWithoutFolder);
    (folderRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(workspaceService.getFileDownloadUrl('file-123', 'user-123', 'admin'))
      .rejects.toThrow('Folder not found');
  });
});
