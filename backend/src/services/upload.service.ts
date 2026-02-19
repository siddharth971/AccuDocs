import { UploadToken, Checklist, Client, Folder, File as FileModel } from '../models';
import { checklistRepository, folderRepository, fileRepository, clientRepository, logRepository } from '../repositories';
import { s3Helpers } from '../config/s3.config';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as path from 'path';
// archiver is optional — install with: npm i archiver @types/archiver
let archiver: any;
try { archiver = require('archiver'); } catch (e) { /* optional */ }
import { Readable, PassThrough } from 'stream';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.config';
import { config } from '../config/env.config';

// Allowed file types for document upload
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/zip',
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE_WHATSAPP = 25 * 1024 * 1024; // 25MB (WhatsApp limit)
const UPLOAD_TOKEN_EXPIRY_DAYS = 7;

// Sanitize filename for S3 key
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\-.\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

export const uploadService = {

  // ========== UPLOAD TOKEN MANAGEMENT ==========

  /**
   * Generate a secure upload link for a checklist
   */
  async generateUploadToken(
    checklistId: string,
    userId: string,
    ip?: string
  ): Promise<{ token: string; url: string; expiresAt: Date }> {
    // Verify checklist exists
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + UPLOAD_TOKEN_EXPIRY_DAYS);

    // Save token
    await UploadToken.create({
      token,
      checklistId,
      clientId: checklist.clientId,
      expiresAt,
      maxUploads: (checklist as any).totalItems || 20,
    });

    // Log it
    await logRepository.create({
      userId,
      action: 'UPLOAD_LINK_GENERATED' as any,
      description: `Generated upload link for checklist "${(checklist as any).name}"`,
      entityType: 'checklist',
      entityId: checklistId,
      ip,
    });

    const baseUrl = process.env.FRONTEND_URL || config.cors.origin.split(',')[0] || 'http://localhost:4200';
    const uploadUrl = `${baseUrl}/upload/${token}`;

    logger.info(`Upload token generated for checklist ${checklistId}: ${token.substring(0, 8)}...`);

    return {
      token,
      url: uploadUrl,
      expiresAt,
    };
  },

  /**
   * Validate an upload token and return checklist data
   */
  async validateUploadToken(token: string): Promise<{
    checklist: any;
    client: any;
    items: any[];
    expired: boolean;
  }> {
    const uploadToken = await UploadToken.findOne({
      where: { token },
      include: [
        { model: Checklist, as: 'checklist' },
        {
          model: Client, as: 'client',
          include: [{ association: 'user', attributes: ['id', 'name', 'mobile'] }],
        },
      ],
    });

    if (!uploadToken) throw new NotFoundError('Invalid upload link');

    const expired = new Date() > uploadToken.expiresAt || uploadToken.isUsed;

    return {
      checklist: uploadToken.checklist,
      client: uploadToken.client,
      items: (uploadToken.checklist as any)?.items || [],
      expired,
    };
  },

  // ========== FILE UPLOAD HANDLING ==========

  /**
   * Upload a file via upload token (public upload page)
   */
  async uploadViaToken(
    token: string,
    itemId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number }
  ): Promise<{ itemId: string; fileName: string; status: string }> {
    // Validate token
    const uploadToken = await UploadToken.findOne({
      where: { token },
      include: [{ model: Checklist, as: 'checklist' }],
    });

    if (!uploadToken) throw new NotFoundError('Invalid upload link');
    if (new Date() > uploadToken.expiresAt) throw new ForbiddenError('Upload link has expired');
    if (uploadToken.isUsed) throw new ForbiddenError('Upload link has been fully used');
    if (uploadToken.uploadCount >= uploadToken.maxUploads) {
      throw new BadRequestError('Maximum upload limit reached');
    }

    // Validate file
    this.validateFile(file);

    // Get checklist + client info
    const checklist = uploadToken.checklist as any;
    const client = await Client.findByPk(uploadToken.clientId, {
      include: [{ association: 'user', attributes: ['id', 'name'] }],
    });
    if (!client) throw new NotFoundError('Client not found');

    // Store the file
    const result = await this.storeChecklistFile(
      checklist,
      client,
      itemId,
      file,
      'upload_link'
    );

    // Update token usage
    await uploadToken.update({
      uploadCount: uploadToken.uploadCount + 1,
    });

    return result;
  },

  /**
   * Upload a file via admin dashboard
   */
  async uploadViaAdmin(
    checklistId: string,
    itemId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    userId: string,
    ip?: string
  ): Promise<{ itemId: string; fileName: string; status: string }> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const client = await Client.findByPk((checklist as any).clientId, {
      include: [{ association: 'user', attributes: ['id', 'name'] }],
    });
    if (!client) throw new NotFoundError('Client not found');

    this.validateFile(file);

    const result = await this.storeChecklistFile(
      checklist,
      client,
      itemId,
      file,
      'admin'
    );

    await logRepository.create({
      userId,
      action: 'CHECKLIST_FILE_UPLOADED' as any,
      description: `Admin uploaded "${file.originalname}" for checklist item`,
      entityType: 'checklist',
      entityId: checklistId,
      ip,
    });

    return result;
  },

  /**
   * Handle file upload from WhatsApp
   */
  async uploadViaWhatsApp(
    clientId: string,
    checklistId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    autoItemId?: string
  ): Promise<{ itemId: string; fileName: string; status: string } | null> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) return null;

    const client = await Client.findByPk(clientId, {
      include: [{ association: 'user', attributes: ['id', 'name'] }],
    });
    if (!client) return null;

    // Validate (WhatsApp has smaller limit)
    if (file.size > MAX_FILE_SIZE_WHATSAPP) {
      logger.warn(`WhatsApp file too large: ${file.size} bytes`);
      return null;
    }

    // Find the target item
    let itemId = autoItemId;
    if (!itemId) {
      // Auto-detect: find the first pending item
      const items = (checklist as any).items || [];
      const pendingItem = items.find((item: any) => item.status === 'pending');
      if (!pendingItem) return null;
      itemId = pendingItem.id;
    }

    if (!itemId) return null;

    return await this.storeChecklistFile(
      checklist,
      client,
      itemId,
      file,
      'whatsapp'
    );
  },

  // ========== CORE STORAGE LOGIC ==========

  /**
   * Store a file for a checklist item
   * Handles: S3 upload, folder creation, DB records, checklist item update
   */
  async storeChecklistFile(
    checklist: any,
    client: any,
    itemId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    uploadedVia: 'whatsapp' | 'upload_link' | 'admin'
  ): Promise<{ itemId: string; fileName: string; status: string }> {
    const items: any[] = checklist.items || [];
    const item = items.find((i: any) => i.id === itemId);
    if (!item) throw new NotFoundError('Checklist item not found');

    const clientCode = client.code || client.id;
    const clientName = client.user?.name || clientCode;
    const financialYear = checklist.financialYear;
    const checklistName = sanitizeFileName(checklist.name.split(' - ')[0]); // Remove FY suffix
    const ext = path.extname(file.originalname) || '.pdf';
    const itemLabel = sanitizeFileName(item.label);
    const fileName = `${itemLabel}${ext}`;

    // 1. Build S3 path
    const s3Key = `clients/${clientCode}/${financialYear}/${checklistName}/${fileName}`;

    // 2. Upload to S3
    await s3Helpers.uploadFile(s3Key, file.buffer, file.mimetype, {
      clientId: client.id,
      checklistId: checklist.id,
      itemId,
      uploadedVia,
      originalName: file.originalname,
    });

    // 3. Ensure folder structure exists in DB
    const folder = await this.ensureChecklistFolder(client.id, clientCode, financialYear, checklistName);

    // 4. Create File record
    const fileRecord = await FileModel.create({
      fileName,
      originalName: file.originalname,
      s3Path: s3Key,
      mimeType: file.mimetype,
      size: file.size,
      folderId: folder.id,
      uploadedBy: client.user?.id || client.id,
    });

    // 5. Update checklist item
    item.status = 'uploaded';
    item.receivedDate = new Date().toISOString();
    item.fileId = fileRecord.id;
    item.fileName = file.originalname;
    item.s3Path = s3Key;
    item.uploadedVia = uploadedVia;

    // Calculate new progress
    const receivedItems = items.filter((i: any) => i.status === 'uploaded' || i.status === 'verified').length;
    const progress = Math.round((receivedItems / items.length) * 100);
    const isComplete = receivedItems === items.length;

    await checklistRepository.update(checklist.id, {
      items,
      receivedItems,
      progress,
      status: isComplete ? 'completed' : 'active',
    } as any);

    logger.info(`📁 Stored file for ${clientName}: ${s3Key} (via ${uploadedVia})`);

    return {
      itemId,
      fileName: file.originalname,
      status: 'uploaded',
    };
  },

  /**
   * Ensure the folder structure exists for a checklist upload
   * Creates: root → year → checklist subfolder
   */
  async ensureChecklistFolder(
    clientId: string,
    clientCode: string,
    financialYear: string,
    checklistName: string
  ): Promise<Folder> {
    // 1. Find or note root folder
    let rootFolder = await folderRepository.findRootByClientId(clientId);
    if (!rootFolder) {
      // Create root folder
      rootFolder = await Folder.create({
        name: clientCode,
        slug: clientCode.toLowerCase(),
        type: 'root',
        clientId,
        s3Prefix: `clients/${clientCode}/`,
      });
    }

    // 2. Find or create year folder
    const yearSlug = financialYear.toLowerCase().replace(/\s+/g, '-');
    let yearFolder = await Folder.findOne({
      where: { clientId, parentId: rootFolder.id, slug: yearSlug },
    });
    if (!yearFolder) {
      yearFolder = await Folder.create({
        name: financialYear,
        slug: yearSlug,
        type: 'year' as any,
        clientId,
        parentId: rootFolder.id,
        s3Prefix: `clients/${clientCode}/${financialYear}/`,
      });
    }

    // 3. Find or create checklist subfolder
    const checklistSlug = checklistName.toLowerCase().replace(/\s+/g, '-');
    let checklistFolder = await Folder.findOne({
      where: { clientId, parentId: yearFolder.id, slug: checklistSlug },
    });
    if (!checklistFolder) {
      checklistFolder = await Folder.create({
        name: checklistName,
        slug: checklistSlug,
        type: 'documents' as any,
        clientId,
        parentId: yearFolder.id,
        s3Prefix: `clients/${clientCode}/${financialYear}/${checklistName}/`,
      });
    }

    return checklistFolder;
  },

  // ========== DOWNLOAD ==========

  /**
   * Download a single checklist item file
   */
  async downloadChecklistFile(
    checklistId: string,
    itemId: string,
    userId: string,
    ip?: string
  ): Promise<{ url: string; fileName: string }> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const items = (checklist as any).items || [];
    const item = items.find((i: any) => i.id === itemId);
    if (!item) throw new NotFoundError('Checklist item not found');
    if (!item.s3Path) throw new NotFoundError('File not uploaded yet');

    const url = await s3Helpers.getSignedDownloadUrl(item.s3Path);

    await logRepository.create({
      userId,
      action: 'CHECKLIST_FILE_DOWNLOADED' as any,
      description: `Downloaded "${item.label}" from checklist "${(checklist as any).name}"`,
      entityType: 'checklist',
      entityId: checklistId,
      ip,
    });

    return { url, fileName: item.fileName || `${item.label}.pdf` };
  },

  /**
   * Download all files from a checklist as ZIP
   */
  async downloadChecklistZip(
    checklistId: string,
    userId: string,
    ip?: string
  ): Promise<{ stream: PassThrough; fileName: string }> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const items = (checklist as any).items || [];
    const uploadedItems = items.filter((i: any) => i.s3Path);

    if (uploadedItems.length === 0) {
      throw new BadRequestError('No files uploaded yet');
    }

    const archive = archiver('zip', { zlib: { level: 5 } });
    const passthrough = new PassThrough();
    archive.pipe(passthrough);

    for (const item of uploadedItems) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.aws.s3Bucket,
          Key: item.s3Path,
        });
        const response = await s3Client.send(command);
        if (response.Body) {
          const ext = path.extname(item.fileName || '') || '.pdf';
          archive.append(response.Body as Readable, {
            name: `${sanitizeFileName(item.label)}${ext}`,
          });
        }
      } catch (err: any) {
        logger.warn(`Failed to fetch file for ZIP: ${item.s3Path} - ${err.message}`);
      }
    }

    archive.finalize();

    const checklistName = sanitizeFileName((checklist as any).name);
    const zipFileName = `${checklistName}.zip`;

    await logRepository.create({
      userId,
      action: 'CHECKLIST_ZIP_DOWNLOADED' as any,
      description: `Downloaded ZIP of checklist "${(checklist as any).name}" (${uploadedItems.length} files)`,
      entityType: 'checklist',
      entityId: checklistId,
      ip,
    });

    return { stream: passthrough, fileName: zipFileName };
  },

  // ========== STATUS MANAGEMENT ==========

  /**
   * Update item status (verify/reject)
   */
  async updateItemStatus(
    checklistId: string,
    itemId: string,
    status: 'verified' | 'rejected' | 'pending',
    userId: string,
    rejectionReason?: string,
    ip?: string
  ): Promise<{ item: any; progress: number }> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const items: any[] = (checklist as any).items || [];
    const item = items.find((i: any) => i.id === itemId);
    if (!item) throw new NotFoundError('Checklist item not found');

    item.status = status;
    if (status === 'rejected') {
      item.rejectionReason = rejectionReason || 'Please re-upload';
    } else {
      item.rejectionReason = null;
    }

    const receivedItems = items.filter((i: any) => i.status === 'uploaded' || i.status === 'verified').length;
    const progress = Math.round((receivedItems / items.length) * 100);
    const allVerified = items.every((i: any) => i.status === 'verified');

    await checklistRepository.update(checklistId, {
      items,
      receivedItems,
      progress,
      status: allVerified ? 'completed' : 'active',
    } as any);

    await logRepository.create({
      userId,
      action: `CHECKLIST_ITEM_${status.toUpperCase()}` as any,
      description: `${status} item "${item.label}" in checklist`,
      entityType: 'checklist',
      entityId: checklistId,
      ip,
    });

    return { item, progress };
  },

  // ========== VALIDATION ==========

  /**
   * Validate file type and size
   */
  validateFile(file: { originalname: string; mimetype: string; size: number }): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        `File type "${file.mimetype}" is not allowed. Allowed types: PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, CSV`
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(
        `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`
      );
    }

    if (file.size === 0) {
      throw new BadRequestError('File is empty');
    }
  },
};
