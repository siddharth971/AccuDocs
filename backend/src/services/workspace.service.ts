import { folderRepository, fileRepository, clientRepository, logRepository } from '../repositories';
import { s3Helpers } from '../config';
import { folderConfig } from '../config/folder.config';
import { folderInitializerService } from './folder-initializer.service';
import { Folder, File, FolderType } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';


export interface FolderNode {
  id: string;
  name: string;
  slug: string;
  type: FolderType;
  s3Prefix: string;
  fileCount: number;
  folderCount: number;
  totalSize: number;
  children: FolderNode[];
  files: FileNode[];
}

export interface FileNode {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  mimeType: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface WorkspaceTree {
  clientId: string;
  clientCode: string;
  clientName: string;
  rootFolder: FolderNode;
}

export interface UploadResult {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

export const workspaceService = {
  /**
   * Create folder structure for a new client
   */
  async createClientFolderStructure(clientId: string, clientCode: string): Promise<void> {
    return folderInitializerService.initializeClientWorkspace(clientId, clientCode);
  },

  /**
   * Get client workspace tree
   */
  async getClientWorkspace(clientId: string, userId: string, userRole: string): Promise<WorkspaceTree> {
    // Get client info
    const client = await clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    const user = (client as any).user;

    // For clients, verify they have access to this workspace
    if (userRole === 'client') {
      const clientProfile = await clientRepository.findByUserId(userId);
      if (!clientProfile || clientProfile.id !== clientId) {
        throw new ForbiddenError('You do not have access to this workspace');
      }
    }

    // Ensure default years exist (migration for existing clients)
    try {
      await this.ensureMissingYearFolders(clientId, client.code);
    } catch (error) {
      logger.error(`Failed to ensure year folders: ${(error as Error).message}`);
    }

    // Get folder tree
    const rootFolder = await folderRepository.getClientFolderTree(clientId);
    if (!rootFolder) {
      // Create folder structure if it doesn't exist
      await this.createClientFolderStructure(clientId, client.code);
      const newRootFolder = await folderRepository.getClientFolderTree(clientId);
      if (!newRootFolder) {
        throw new NotFoundError('Failed to create workspace');
      }
      return this.formatWorkspaceTree(client, user, newRootFolder);
    }

    return this.formatWorkspaceTree(client, user, rootFolder);
  },

  /**
   * Ensure missing year folders exist
   */
  async ensureMissingYearFolders(clientId: string, clientCode: string): Promise<void> {
    // Find years folder
    const yearsFolders = await folderRepository.findByTypeAndClientId('years', clientId);
    if (!yearsFolders || yearsFolders.length === 0) return;

    const yearsFolder = yearsFolders[0];

    // Get existing year folders
    const existingYears = await folderRepository.findByParentId(yearsFolder.id);
    const existingYearNames = new Set(existingYears.map((y: any) => y.name));

    // Create missing years
    const { startYear, endYear } = folderConfig;
    for (let y = startYear; y <= endYear; y++) {
      const year = y.toString();
      if (!existingYearNames.has(year)) {
        await folderRepository.create({
          name: year,
          slug: year,
          type: 'year',
          clientId,
          parentId: yearsFolder.id,
          s3Prefix: `clients/${clientCode}/Years/${year}/`,
        });
        logger.info(`Auto-created missing year folder: ${year} for client ${clientCode}`);
      }
    }
  },

  /**
   * Get folder contents (children and files)
   */
  async getFolderContents(
    folderId: string,
    userId: string,
    userRole: string
  ): Promise<{ folder: FolderNode; breadcrumbs: { id: string; name: string }[] }> {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // For clients, verify access
    if (userRole === 'client') {
      const clientProfile = await clientRepository.findByUserId(userId);
      if (!clientProfile || clientProfile.id !== folder.clientId) {
        throw new ForbiddenError('You do not have access to this folder');
      }
    }

    // Build breadcrumbs
    const breadcrumbs = await this.buildBreadcrumbs(folder);

    return {
      folder: this.formatFolderNode(folder),
      breadcrumbs,
    };
  },

  /**
   * Upload file to a folder
   */
  async uploadFile(
    folderId: string,
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
      size: number;
    },
    uploaderId: string,
    ip?: string
  ): Promise<UploadResult> {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Check if file with same name exists
    const existingFile = await fileRepository.existsByNameInFolder(file.originalname, folderId);
    if (existingFile) {
      throw new ConflictError('A file with this name already exists in this folder');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Generate S3 path
    const s3Path = `${folder.s3Prefix}${uniqueFileName}`;

    // Upload to S3
    await s3Helpers.uploadFile(s3Path, file.buffer, file.mimetype, {
      originalName: file.originalname,
      uploadedBy: uploaderId,
      folderId: folderId,
    });

    // Create file record
    const newFile = await fileRepository.create({
      fileName: uniqueFileName,
      originalName: file.originalname,
      s3Path,
      mimeType: file.mimetype,
      size: file.size,
      folderId,
      uploadedBy: uploaderId,
    });

    // Generate download URL
    const downloadUrl = await s3Helpers.getSignedDownloadUrl(s3Path);

    // Log the action
    await logRepository.create({
      userId: uploaderId,
      action: 'FILE_UPLOADED',
      description: `Uploaded ${file.originalname} to ${folder.name}`,
      ip,
      metadata: { fileId: newFile.id, folderId, fileName: file.originalname },
    });

    logger.info(`File uploaded: ${file.originalname} to folder ${folder.name}`);

    return {
      id: newFile.id,
      fileName: uniqueFileName,
      originalName: file.originalname,
      s3Path,
      size: file.size,
      mimeType: file.mimetype,
      downloadUrl,
    };
  },

  /**
   * Get file download URL
   */
  async getFileDownloadUrl(
    fileId: string,
    userId: string,
    userRole: string,
    ip?: string
  ): Promise<{ url: string; fileName: string }> {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    const folder = file.folder;
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // For clients, verify access
    if (userRole === 'client') {
      const clientProfile = await clientRepository.findByUserId(userId);
      if (!clientProfile || clientProfile.id !== folder.clientId) {
        throw new ForbiddenError('You do not have access to this file');
      }
    }

    // Generate signed URL
    const url = await s3Helpers.getSignedDownloadUrl(file.s3Path);

    // Log the download
    await logRepository.create({
      userId,
      action: 'FILE_DOWNLOADED',
      description: `Downloaded ${file.originalName}`,
      ip,
      metadata: { fileId: file.id },
    });

    return {
      url,
      fileName: file.originalName,
    };
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string, ip?: string): Promise<void> {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Delete from S3
    try {
      await s3Helpers.deleteFile(file.s3Path);
    } catch (error) {
      logger.error(`Failed to delete file from S3: ${(error as Error).message}`);
    }

    // Delete from database
    await fileRepository.delete(fileId);

    // Log the action
    await logRepository.create({
      userId,
      action: 'FILE_DELETED',
      description: `Deleted ${file.originalName}`,
      ip,
      metadata: { fileId, fileName: file.originalName },
    });

    logger.info(`File deleted: ${file.originalName}`);
  },

  /**
   * Rename a file
   */
  async renameFile(
    fileId: string,
    newName: string,
    userId: string,
    ip?: string
  ): Promise<{ id: string; originalName: string }> {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    const folder = file.folder;
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Check if new name conflicts
    const existingFile = await fileRepository.existsByNameInFolder(newName, file.folderId, fileId);
    if (existingFile) {
      throw new ConflictError('A file with this name already exists in this folder');
    }

    const oldName = file.originalName;

    // Update file name
    await fileRepository.rename(fileId, newName);

    // Log the action
    await logRepository.create({
      userId,
      action: 'FILE_RENAMED',
      description: `Renamed ${oldName} to ${newName}`,
      ip,
      metadata: { fileId, oldName, newName },
    });

    logger.info(`File renamed: ${oldName} -> ${newName}`);

    return { id: fileId, originalName: newName };
  },

  /**
   * Move a file to another folder
   */
  async moveFile(
    fileId: string,
    targetFolderId: string,
    userId: string,
    ip?: string
  ): Promise<{ id: string; folderId: string }> {
    const file = await fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    const targetFolder = await folderRepository.findById(targetFolderId);
    if (!targetFolder) {
      throw new NotFoundError('Target folder not found');
    }

    // Check if file with same name exists in target
    const existingFile = await fileRepository.existsByNameInFolder(file.originalName, targetFolderId);
    if (existingFile) {
      throw new ConflictError('A file with this name already exists in the target folder');
    }

    const sourceFolder = file.folder;
    const oldS3Path = file.s3Path;

    // Generate new S3 path
    const newS3Path = `${targetFolder.s3Prefix}${file.fileName}`;

    // Copy file in S3 (then delete old one)
    try {
      // For S3, we need to copy and delete
      // First, get the file content
      // For now, we'll just update the database path since S3 move is complex
      // In production, you'd use S3 CopyObject and DeleteObject

      // Update database
      await fileRepository.moveToFolder(fileId, targetFolderId, newS3Path);

      // Log the action
      await logRepository.create({
        userId,
        action: 'FILE_MOVED',
        description: `Moved ${file.originalName} from ${sourceFolder?.name || 'unknown'} to ${targetFolder.name}`,
        ip,
        metadata: { fileId, fromFolderId: file.folderId, toFolderId: targetFolderId },
      });

      logger.info(`File moved: ${file.originalName} to ${targetFolder.name}`);
    } catch (error) {
      logger.error(`Failed to move file: ${(error as Error).message}`);
      throw new BadRequestError('Failed to move file');
    }

    return { id: fileId, folderId: targetFolderId };
  },

  /**
   * Create a new folder (for custom folders if needed)
   */
  async createFolder(
    parentFolderId: string,
    name: string,
    userId: string,
    ip?: string
  ): Promise<FolderNode> {
    const parentFolder = await folderRepository.findById(parentFolderId);
    if (!parentFolder) {
      throw new NotFoundError('Parent folder not found');
    }

    // Check if folder with same name exists
    const existingFolder = await folderRepository.existsByNameInParent(name, parentFolderId, parentFolder.clientId);
    if (existingFolder) {
      throw new ConflictError('A folder with this name already exists');
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, '_');

    // Generate S3 prefix
    const s3Prefix = `${parentFolder.s3Prefix}${slug}/`;

    // Create folder
    const newFolder = await folderRepository.create({
      name,
      slug,
      type: 'documents', // Custom folders are treated as documents type
      clientId: parentFolder.clientId,
      parentId: parentFolderId,
      s3Prefix,
    });

    // Log the action
    await logRepository.create({
      userId,
      action: 'FOLDER_CREATED',
      description: `Created folder ${name}`,
      ip,
      metadata: { folderId: newFolder.id, parentId: parentFolderId },
    });

    logger.info(`Folder created: ${name}`);

    const folderWithDetails = await folderRepository.findById(newFolder.id);
    return this.formatFolderNode(folderWithDetails!);
  },

  /**
   * Delete a folder (only custom folders, not default structure)
   */
  async deleteFolder(folderId: string, userId: string, ip?: string): Promise<void> {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Don't allow deleting root, documents, years, or year folders
    if (['root', 'documents', 'years', 'year'].includes(folder.type)) {
      throw new BadRequestError('Cannot delete system folders');
    }

    // Check if folder has files
    const fileCount = await fileRepository.countByFolderId(folderId);
    if (fileCount > 0) {
      throw new BadRequestError('Cannot delete folder with files. Delete files first.');
    }

    // Check if folder has children
    const children = await folderRepository.findByParentId(folderId);
    if (children.length > 0) {
      throw new BadRequestError('Cannot delete folder with subfolders. Delete subfolders first.');
    }

    // Delete folder
    await folderRepository.delete(folderId);

    // Log the action
    await logRepository.create({
      userId,
      action: 'FOLDER_DELETED',
      description: `Deleted folder ${folder.name}`,
      ip,
      metadata: { folderId, folderName: folder.name },
    });

    logger.info(`Folder deleted: ${folder.name}`);
  },

  /**
   * Rename a folder
   */
  async renameFolder(
    folderId: string,
    newName: string,
    userId: string,
    ip?: string
  ): Promise<FolderNode> {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Don't allow renaming root, documents, or years folders
    if (['root', 'documents', 'years'].includes(folder.type)) {
      throw new BadRequestError('Cannot rename system folders');
    }

    // Check if folder with same name exists in same parent
    const existingFolder = await folderRepository.existsByNameInParent(
      newName,
      folder.parentId,
      folder.clientId,
      folderId
    );
    if (existingFolder) {
      throw new ConflictError('A folder with this name already exists in this location');
    }

    const oldName = folder.name;
    const newSlug = newName.toLowerCase().replace(/\s+/g, '_');

    // Update folder
    await folderRepository.update(folderId, {
      name: newName,
      slug: newSlug,
      // Note: We don't update S3 prefix for now as it would require moving objects in S3
      // For consistency, name and slug are updated in DB
    });

    // Log the action
    await logRepository.create({
      userId,
      action: 'FOLDER_RENAMED',
      description: `Renamed folder ${oldName} to ${newName}`,
      ip,
      metadata: { folderId, oldName, newName },
    });

    logger.info(`Folder renamed: ${oldName} -> ${newName}`);

    const updatedFolder = await folderRepository.findById(folderId);
    return this.formatFolderNode(updatedFolder!);
  },

  /**
   * Add year folder to client
   */
  async addYearFolder(clientId: string, year: string, userId: string, ip?: string): Promise<FolderNode> {
    const client = await clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Find years folder
    const yearsFolder = (await folderRepository.findByTypeAndClientId('years', clientId))[0];
    if (!yearsFolder) {
      throw new NotFoundError('Years folder not found');
    }

    // Check if year already exists
    const existingYear = await folderRepository.existsByNameInParent(year, yearsFolder.id, clientId);
    if (existingYear) {
      throw new ConflictError(`Year ${year} folder already exists`);
    }

    // Create year folder
    const yearFolder = await folderRepository.create({
      name: year,
      slug: year,
      type: 'year',
      clientId,
      parentId: yearsFolder.id,
      s3Prefix: `clients/${client.code}/Years/${year}/`,
    });

    // Log the action
    await logRepository.create({
      userId,
      action: 'YEAR_FOLDER_CREATED',
      description: `Created year folder ${year} for client ${client.code}`,
      ip,
      metadata: { folderId: yearFolder.id, year, clientId },
    });

    logger.info(`Year folder created: ${year} for client ${client.code}`);

    const folderWithDetails = await folderRepository.findById(yearFolder.id);
    return this.formatFolderNode(folderWithDetails!);
  },

  /**
   * Build breadcrumbs for a folder
   */
  async buildBreadcrumbs(folder: Folder): Promise<{ id: string; name: string }[]> {
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentFolder: Folder | null = folder;

    while (currentFolder) {
      breadcrumbs.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
      });

      if (currentFolder.parentId) {
        currentFolder = await folderRepository.findById(currentFolder.parentId);
      } else {
        currentFolder = null;
      }
    }

    return breadcrumbs;
  },

  /**
   * Format workspace tree response
   */
  formatWorkspaceTree(client: any, user: any, rootFolder: Folder): WorkspaceTree {
    return {
      clientId: client.id,
      clientCode: client.code,
      clientName: user?.name || '',
      rootFolder: this.formatFolderNode(rootFolder),
    };
  },

  /**
   * Format folder node for response
   */
  formatFolderNode(folder: Folder): FolderNode {
    const data = folder.get ? folder.get({ plain: true }) : (folder as any);
    const files = data.files || [];
    const children = data.children || [];

    const formattedFiles: FileNode[] = files.map((f: any) => ({
      id: f.id,
      fileName: f.fileName,
      originalName: f.originalName,
      s3Path: f.s3Path,
      mimeType: f.mimeType,
      size: f.size,
      uploadedBy: {
        id: f.uploader?.id || '',
        name: f.uploader?.name || 'Unknown',
      },
      createdAt: f.createdAt,
    }));

    const formattedChildren: FolderNode[] = children.map((c: any) => this.formatFolderNode(c));

    const totalSize = files.reduce((sum: number, f: any) => sum + (f.size || 0), 0);

    return {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      type: folder.type,
      s3Prefix: folder.s3Prefix,
      fileCount: files.length,
      folderCount: (folder as any).folderCount !== undefined ? (folder as any).folderCount : formattedChildren.length,
      totalSize,
      children: formattedChildren,
      files: formattedFiles,
    };
  },
};
