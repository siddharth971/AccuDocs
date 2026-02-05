import { userRepository, clientRepository, yearRepository, logRepository } from '../repositories';
import { User, Client, Year, Folder, File, Document } from '../models';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database.config';
import { folderInitializerService } from './folder-initializer.service';

export interface CreateClientInput {
  name: string;
  mobile: string;
  code: string;
}

export interface UpdateClientInput {
  name?: string;
  mobile?: string;
  code?: string;
}

export interface ClientWithUser {
  id: string;
  code: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    isActive: boolean;
  };
  years: {
    id: string;
    year: string;
    documentCount: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const clientService = {
  /**
   * Create a new client
   */
  async create(
    data: CreateClientInput,
    adminId: string,
    ip?: string
  ): Promise<ClientWithUser> {
    // Note: Multiple clients can share the same mobile number
    // Each client will have their own user account with the same mobile

    // Check if code already exists (codes must still be unique)
    const existingClient = await clientRepository.existsByCode(data.code);
    if (existingClient) {
      throw new ConflictError('A client with this code already exists');
    }

    const t = await sequelize.transaction();

    try {
      // Create user first
      const user = await userRepository.create({
        name: data.name,
        mobile: data.mobile,
        role: 'client',
        isActive: true,
      }, { transaction: t });

      // Create client profile
      const client = await clientRepository.create({
        code: data.code,
        userId: user.id,
      }, { transaction: t });

      // Create default year folders (Legacy support - can be removed if strictly using folders)
      // Maintaining transaction compatibility if yearRepository supports it, but ignoring for now 
      // as requirement focuses on folder hierarchy. The old Logic used yearRepository.createMany
      // which we didn't update. However, new logic uses folderInitializer.

      // Initialize Workspace Folder Structure (Transactional)
      await folderInitializerService.initializeClientWorkspace(client.id, data.code, t);

      // Log the action (Logging typically outside transaction or after commit)
      // But for consistency we can log after.

      await t.commit();

      // Log the action
      await logRepository.create({
        userId: adminId,
        action: 'CLIENT_CREATED',
        description: `Created client ${data.code} - ${data.name}`,
        ip,
      });

      logger.info(`Client created: ${data.code} - ${data.name}`);

      // Fetch and return the complete client data
      const fullClient = await clientRepository.findById(client.id);
      return this.formatClientResponse(fullClient!);

    } catch (error) {
      await t.rollback();
      logger.error(`Failed to create client ${data.code}: ${(error as Error).message}`);
      throw error;
    }
  },

  /**
   * Update a client
   */
  async update(
    id: string,
    data: UpdateClientInput,
    adminId: string,
    ip?: string
  ): Promise<ClientWithUser> {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Note: Multiple clients can share the same mobile number, so no conflict check needed for mobile

    // Check if new code conflicts
    if (data.code) {
      const existingClient = await clientRepository.existsByCode(data.code, id);
      if (existingClient) {
        throw new ConflictError('A client with this code already exists');
      }
    }

    // Update user if name or mobile changed
    if (data.name || data.mobile) {
      await userRepository.update(client.userId, {
        ...(data.name && { name: data.name }),
        ...(data.mobile && { mobile: data.mobile }),
      });
    }

    // Update client if code changed
    if (data.code) {
      await clientRepository.update(id, { code: data.code });
    }

    // Log the action
    await logRepository.create({
      userId: adminId,
      action: 'CLIENT_UPDATED',
      description: `Updated client ${client.code}`,
      ip,
      metadata: { updates: data },
    });

    logger.info(`Client updated: ${client.code}`);

    const updatedClient = await clientRepository.findById(id);
    return this.formatClientResponse(updatedClient!);
  },

  /**
   * Delete a client
   */
  async delete(id: string, adminId: string, ip?: string): Promise<void> {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Capture userId before any deletion
    const userId = client.userId;

    try {
      // Use a transaction to ensure all raw queries run on the same connection
      await sequelize.transaction(async (transaction) => {
        // 1. Disable foreign keys for this connection
        // PRAGMA foreign_keys is per-connection in SQLite
        await sequelize.query('PRAGMA foreign_keys = OFF', { transaction });
        logger.info(`Disabled foreign keys for client ${client.code} deletion`);

        // 2. Files Removal
        await sequelize.query(
          `DELETE FROM files WHERE folder_id IN (SELECT id FROM folders WHERE client_id = :id)`,
          { replacements: { id }, transaction }
        );
        logger.info(`Deleted files for client ${client.code}`);

        // 3. Unlink Folders (to break self-referential parent_id constraints)
        await sequelize.query(
          `UPDATE folders SET parent_id = NULL WHERE client_id = :id`,
          { replacements: { id }, transaction }
        );
        logger.info(`Unlinked folders for client ${client.code}`);

        // 4. Folders Removal
        await sequelize.query(
          `DELETE FROM folders WHERE client_id = :id`,
          { replacements: { id }, transaction }
        );
        logger.info(`Deleted folders for client ${client.code}`);

        // 5. Documents Removal
        await sequelize.query(
          `DELETE FROM documents WHERE year_id IN (SELECT id FROM years WHERE client_id = :id)`,
          { replacements: { id }, transaction }
        );
        logger.info(`Deleted documents for client ${client.code}`);

        // 6. Years Removal
        await sequelize.query(
          `DELETE FROM years WHERE client_id = :id`,
          { replacements: { id }, transaction }
        );
        logger.info(`Deleted years for client ${client.code}`);

        // 7. Client Removal
        await sequelize.query(
          `DELETE FROM clients WHERE id = :id`,
          { replacements: { id }, transaction }
        );
        logger.info(`Deleted client record ${client.code}`);

        // 8. Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON', { transaction });
        logger.info(`Re-enabled foreign keys for client ${client.code} deletion`);
      });

      // 9. User Deactivation
      await User.update({ isActive: false }, { where: { id: userId } });
      logger.info(`Deactivated user for client ${client.code}`);

      // 10. Audit Log
      await logRepository.create({
        userId: adminId,
        action: 'CLIENT_DELETED',
        description: `Deleted client ${client.code}`,
        ip,
      });

    } catch (error) {
      logger.error(`Failed to delete client ${client.code}: ${(error as Error).message}`);
      throw error;
    }
  },

  /**
   * Get client by ID
   */
  async getById(id: string): Promise<ClientWithUser> {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }
    return this.formatClientResponse(client);
  },

  /**
   * Get client by code
   */
  async getByCode(code: string): Promise<ClientWithUser> {
    const client = await clientRepository.findByCode(code);
    if (!client) {
      throw new NotFoundError('Client not found');
    }
    return this.formatClientResponse(client);
  },

  /**
   * Get all clients with pagination
   */
  async getAll(
    filters: { search?: string } = {},
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = { page: 1, limit: 10 }
  ): Promise<{ clients: ClientWithUser[]; total: number }> {
    const { clients, total } = await clientRepository.findAll(filters, pagination);

    return {
      clients: clients.map((c) => this.formatClientResponse(c)),
      total,
    };
  },

  /**
   * Toggle client active status
   */
  async toggleActive(id: string, adminId: string, ip?: string): Promise<ClientWithUser> {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    const user = await userRepository.findById(client.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.update(client.userId, { isActive: !user.isActive });

    // Log the action
    await logRepository.create({
      userId: adminId,
      action: 'CLIENT_UPDATED',
      description: `${user.isActive ? 'Deactivated' : 'Activated'} client ${client.code}`,
      ip,
    });

    const updatedClient = await clientRepository.findById(id);
    return this.formatClientResponse(updatedClient!);
  },

  /**
   * Get next available client code
   */
  async getNextCode(): Promise<string> {
    return clientRepository.getNextCode();
  },

  /**
   * Format client response
   */
  formatClientResponse(client: Client): ClientWithUser {
    const user = (client as any).user;
    const years = (client as any).years || [];

    return {
      id: client.id,
      code: client.code,
      user: {
        id: user?.id || '',
        name: user?.name || '',
        mobile: user?.mobile || '',
        isActive: user?.isActive ?? true,
      },
      years: years.map((y: any) => ({
        id: y.id,
        year: y.year,
        documentCount: y.documents?.length || 0,
      })),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  },
};
