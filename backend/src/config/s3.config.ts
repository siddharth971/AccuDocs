import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './env.config';
import { logger } from '../utils/logger';

export const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export const s3Helpers = {
  /**
   * Generate the S3 key path for a document
   */
  generateDocumentKey(clientCode: string, year: string, fileName: string): string {
    return `clients/${clientCode}/${year}/${fileName}`;
  },

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        ServerSideEncryption: 'AES256',
      });

      await s3Client.send(command);
      logger.info(`✅ File uploaded to S3: ${key}`);
      return key;
    } catch (error) {
      logger.error(`❌ Failed to upload file to S3: ${key}`, error);
      throw error;
    }
  },

  /**
   * Generate a pre-signed URL for downloading a file
   */
  async getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: expiresIn || config.aws.signedUrlExpiry,
      });

      logger.debug(`📝 Generated signed URL for: ${key}`);
      return url;
    } catch (error) {
      logger.error(`❌ Failed to generate signed URL for: ${key}`, error);
      throw error;
    }
  },

  /**
   * Generate a pre-signed URL for uploading a file
   */
  async getSignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: expiresIn || config.aws.signedUrlExpiry,
      });

      logger.debug(`📝 Generated signed upload URL for: ${key}`);
      return url;
    } catch (error) {
      logger.error(`❌ Failed to generate signed upload URL for: ${key}`, error);
      throw error;
    }
  },

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`🗑️ File deleted from S3: ${key}`);
    } catch (error) {
      logger.error(`❌ Failed to delete file from S3: ${key}`, error);
      throw error;
    }
  },

  /**
   * List files in a folder
   */
  async listFiles(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: config.aws.s3Bucket,
        Prefix: prefix,
      });

      const response = await s3Client.send(command);
      const files = response.Contents?.map((obj) => obj.Key || '') || [];
      logger.debug(`📂 Listed ${files.length} files with prefix: ${prefix}`);
      return files;
    } catch (error) {
      logger.error(`❌ Failed to list files with prefix: ${prefix}`, error);
      throw error;
    }
  },
};
