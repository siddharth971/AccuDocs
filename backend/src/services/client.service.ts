import { userRepository, clientRepository, yearRepository, logRepository } from '../repositories';
import { User, Client } from '../models';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

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
    // Check if mobile already exists
    const existingUser = await userRepository.findByMobile(data.mobile);
    if (existingUser) {
      throw new ConflictError('A user with this mobile number already exists');
    }

    // Check if code already exists
    const existingClient = await clientRepository.existsByCode(data.code);
    if (existingClient) {
      throw new ConflictError('A client with this code already exists');
    }

    // Create user first
    const user = await userRepository.create({
      name: data.name,
      mobile: data.mobile,
      role: 'client',
      isActive: true,
    });

    // Create client profile
    const client = await clientRepository.create({
      code: data.code,
      userId: user.id,
    });

    // Create default year folders (2021-2030)
    const years = [];
    for (let year = 2021; year <= 2030; year++) {
      years.push(String(year));
    }
    await yearRepository.createMany(client.id, years);

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

    // Check if new mobile conflicts
    if (data.mobile) {
      const existingUser = await userRepository.existsByMobile(data.mobile, client.userId);
      if (existingUser) {
        throw new ConflictError('A user with this mobile number already exists');
      }
    }

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

    // Delete client (cascade will handle years and documents)
    await clientRepository.delete(id);

    // Deactivate user instead of deleting
    await userRepository.update(client.userId, { isActive: false });

    // Log the action
    await logRepository.create({
      userId: adminId,
      action: 'CLIENT_DELETED',
      description: `Deleted client ${client.code}`,
      ip,
    });

    logger.info(`Client deleted: ${client.code}`);
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
