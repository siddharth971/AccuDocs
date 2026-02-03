import { folderRepository } from '../repositories';
import { folderConfig } from '../config/folder.config';
import { logger } from '../utils/logger';
import { Transaction } from 'sequelize';

export const folderInitializerService = {
  /**
   * Initialize folder structure for a new client
   * @param clientId Client ID
   * @param clientCode Client Code
   * @param transaction Sequelize Transaction
   */
  async initializeClientWorkspace(
    clientId: string,
    clientCode: string,
    transaction?: Transaction
  ): Promise<void> {
    logger.info(`Initializing workspace for client ${clientCode}`);

    try {
      const options = transaction ? { transaction } : undefined;

      // 1. Create Root Folder
      const rootFolder = await folderRepository.create({
        name: clientCode,
        slug: clientCode.toLowerCase().replace(/\s+/g, '_'),
        type: 'root',
        clientId,
        parentId: null,
        s3Prefix: `clients/${clientCode}/`,
      }, options);

      // 2. Create Documents Folder
      await folderRepository.create({
        name: 'Documents',
        slug: 'documents',
        type: 'documents',
        clientId,
        parentId: rootFolder.id,
        s3Prefix: `clients/${clientCode}/Documents/`,
      }, options);

      // 3. Create Years Folder
      const yearsFolder = await folderRepository.create({
        name: 'Years',
        slug: 'years',
        type: 'years',
        clientId,
        parentId: rootFolder.id,
        s3Prefix: `clients/${clientCode}/Years/`,
      }, options);

      // 4. Create Year Subfolders (based on config)
      const { startYear, endYear } = folderConfig;
      const yearsToCreate: string[] = [];
      for (let y = startYear; y <= endYear; y++) {
        yearsToCreate.push(y.toString());
      }

      // We can use Promise.all for parallelism, but sequential is safer for DB load/deadlocks sometimes.
      // Given it's inside a transaction, sequential is fine.
      for (const year of yearsToCreate) {
        await folderRepository.create({
          name: year,
          slug: year,
          type: 'year',
          clientId,
          parentId: yearsFolder.id,
          s3Prefix: `clients/${clientCode}/Years/${year}/`,
        }, options);
      }

      logger.info(`✅ Workspace initialized for client ${clientCode} with ${yearsToCreate.length} year folders`);
    } catch (error) {
      logger.error(`❌ Failed to initialize workspace for ${clientCode}: ${(error as Error).message}`);
      throw error; // Re-throw to allow rollback
    }
  },
};
