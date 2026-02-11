import { documentRepository, yearRepository, clientRepository, logRepository, documentVersionRepository } from '../repositories';
import { s3Helpers } from '../config';
import { Document } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

export interface DocumentResponse {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  currentVersion: number;
  metadata?: any;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export const documentService = {
  /**
   * Upload a document
   */
  async upload(
    yearId: string,
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
      size: number;
    },
    uploaderId: string,
    ip?: string
  ): Promise<UploadResult> {
    // Verify year exists
    const year = await yearRepository.findById(yearId);
    if (!year) {
      throw new NotFoundError('Year not found');
    }

    // Get client for S3 path
    const client = await clientRepository.findById(year.clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Generate S3 path
    const s3Path = s3Helpers.generateDocumentKey(client.code, year.year, uniqueFileName);

    // Upload to S3
    await s3Helpers.uploadFile(s3Path, file.buffer, file.mimetype, {
      originalName: file.originalname,
      uploadedBy: uploaderId,
      yearId: yearId,
    });

    // Create document record
    const document = await documentRepository.create({
      fileName: uniqueFileName,
      originalName: file.originalname,
      s3Path,
      mimeType: file.mimetype,
      size: file.size,
      yearId,
      uploadedBy: uploaderId,
      currentVersion: 1,
      metadata: {}
    });

    // Create initial version record
    await documentVersionRepository.create({
      documentId: document.id,
      versionNumber: 1,
      fileName: uniqueFileName,
      s3Path: s3Path,
      createdBy: uploaderId,
    });

    // Generate download URL
    const downloadUrl = await s3Helpers.getSignedDownloadUrl(s3Path);

    // Log the action
    await logRepository.create({
      userId: uploaderId,
      action: 'DOCUMENT_UPLOADED',
      description: `Uploaded ${file.originalname} to ${client.code}/${year.year}`,
      ip,
      metadata: { documentId: document.id, fileName: file.originalname },
    });

    logger.info(`Document uploaded: ${file.originalname} to ${client.code}/${year.year}`);

    return {
      id: document.id,
      fileName: uniqueFileName,
      originalName: file.originalname,
      s3Path,
      size: file.size,
      mimeType: file.mimetype,
      downloadUrl,
    };
  },

  /**
   * Get documents by year
   */
  async getByYearId(yearId: string): Promise<DocumentResponse[]> {
    const year = await yearRepository.findById(yearId);
    if (!year) {
      throw new NotFoundError('Year not found');
    }

    const documents = await documentRepository.findByYearId(yearId);
    return documents.map((doc) => this.formatDocumentResponse(doc));
  },

  /**
   * Get document download URL
   */
  async getDownloadUrl(
    documentId: string,
    userId: string,
    userRole: string,
    ip?: string
  ): Promise<{ url: string; fileName: string }> {
    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // For clients, verify they have access to this document
    if (userRole === 'client') {
      const year = await yearRepository.findById(document.yearId);
      if (!year) {
        throw new NotFoundError('Year not found');
      }

      const client = await clientRepository.findByUserId(userId);
      if (!client || client.id !== year.clientId) {
        throw new ForbiddenError('You do not have access to this document');
      }
    }

    // Generate signed URL
    const url = await s3Helpers.getSignedDownloadUrl(document.s3Path);

    // Log the download
    await logRepository.create({
      userId,
      action: 'DOCUMENT_DOWNLOADED',
      description: `Downloaded ${document.originalName}`,
      ip,
      metadata: { documentId: document.id },
    });

    return {
      url,
      fileName: document.originalName,
    };
  },

  /**
   * Delete a document
   */
  async delete(documentId: string, userId: string, ip?: string): Promise<void> {
    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Delete from S3
    try {
      await s3Helpers.deleteFile(document.s3Path);
    } catch (error) {
      logger.error(`Failed to delete file from S3: ${(error as Error).message}`);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    await documentRepository.delete(documentId);

    // Log the action
    await logRepository.create({
      userId,
      action: 'DOCUMENT_DELETED',
      description: `Deleted ${document.originalName}`,
      ip,
      metadata: { documentId: document.id, fileName: document.originalName },
    });

    logger.info(`Document deleted: ${document.originalName}`);
  },

  /**
   * Get all documents with pagination (admin only)
   */
  async getAll(
    filters: { yearId?: string; search?: string; mimeType?: string } = {},
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = { page: 1, limit: 10 }
  ): Promise<{ documents: DocumentResponse[]; total: number }> {
    const { documents, total } = await documentRepository.findAll(filters, pagination);

    return {
      documents: documents.map((doc) => this.formatDocumentResponse(doc)),
      total,
    };
  },

  /**
   * Get document versions
   */
  async getVersions(documentId: string): Promise<any[]> {
    const versions = await documentVersionRepository.findByDocumentId(documentId);
    return versions;
  },

  /**
   * Upload a new version of a document
   */
  async uploadNewVersion(
    documentId: string,
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
      size: number;
    },
    uploaderId: string,
    ip?: string
  ): Promise<any> {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const year = await yearRepository.findById(document.yearId);
    const client = await clientRepository.findById(year!.clientId);

    // Generate unique filename for new version
    const fileExtension = file.originalname.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}_v${document.currentVersion + 1}.${fileExtension}`;
    const s3Path = s3Helpers.generateDocumentKey(client!.code, year!.year, uniqueFileName);

    // Upload to S3
    await s3Helpers.uploadFile(s3Path, file.buffer, file.mimetype, {
      originalName: file.originalname,
      uploadedBy: uploaderId,
      documentId,
      version: String(document.currentVersion + 1),
    });

    // Update main document record
    const newVersionNumber = document.currentVersion + 1;
    await document.update({
      currentVersion: newVersionNumber,
      fileName: uniqueFileName,
      s3Path: s3Path,
      size: file.size,
    });

    // Create version record
    const version = await documentVersionRepository.create({
      documentId: document.id,
      versionNumber: newVersionNumber,
      fileName: uniqueFileName,
      s3Path: s3Path,
      createdBy: uploaderId,
    });

    // Log the action
    await logRepository.create({
      userId: uploaderId,
      action: 'DOCUMENT_VERSION_UPLOADED',
      description: `Uploaded version ${newVersionNumber} for ${document.originalName}`,
      ip,
      metadata: { documentId: document.id, version: newVersionNumber },
    });

    return this.formatDocumentResponse(document);
  },

  /**
   * Get storage statistics
   */
  async getStorageStats(
    clientId?: string
  ): Promise<{
    totalSize: number;
    documentCount: number;
    byYear: { year: string; count: number; size: number }[];
  }> {
    let totalSize = 0;
    let documentCount = 0;
    const byYear: { year: string; count: number; size: number }[] = [];

    if (clientId) {
      const years = await yearRepository.findByClientId(clientId);
      for (const year of years) {
        const yearDocs = await documentRepository.findByYearId(year.id);
        const yearSize = yearDocs.reduce((sum, doc) => sum + doc.size, 0);
        totalSize += yearSize;
        documentCount += yearDocs.length;
        byYear.push({
          year: year.year,
          count: yearDocs.length,
          size: yearSize,
        });
      }
    } else {
      // Get total stats
      const { documents } = await documentRepository.findAll({}, { page: 1, limit: 10000 });
      totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
      documentCount = documents.length;
    }

    return {
      totalSize,
      documentCount,
      byYear,
    };
  },

  /**
   * Format document response
   */
  formatDocumentResponse(document: Document): DocumentResponse {
    const uploader = (document as any).uploader;

    return {
      id: document.id,
      fileName: document.fileName,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      currentVersion: document.currentVersion,
      metadata: document.metadata,
      uploadedBy: {
        id: uploader?.id || '',
        name: uploader?.name || 'Unknown',
      },
      createdAt: document.createdAt,
    };
  },
};
