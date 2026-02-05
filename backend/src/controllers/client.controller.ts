import { Request, Response } from 'express';
import { clientService } from '../services';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middlewares';

/**
 * Create a new client
 * POST /clients
 */
export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const client = await clientService.create(req.body, adminId, ip);
  sendCreated(res, client, 'Client created successfully');
});

/**
 * Get all clients
 * GET /clients
 */
export const getClients = asyncHandler(async (req: Request, res: Response) => {
  const { search, page = 1, limit = 10, sortBy, sortOrder = 'desc' } = req.query;

  const { clients, total } = await clientService.getAll(
    { search: search as string },
    {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    }
  );

  sendPaginated(res, clients, Number(page), Number(limit), total);
});

/**
 * Get client by ID
 * GET /clients/:id
 */
export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.getById(req.params.id);
  sendSuccess(res, client);
});

/**
 * Get client by code
 * GET /clients/code/:code
 */
export const getClientByCode = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.getByCode(req.params.code);
  sendSuccess(res, client);
});

/**
 * Update client
 * PUT /clients/:id
 */
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  let clientId = req.params.id;

  // Manual patch for frontend sending 'null' as ID
  if (clientId === 'null' && req.body.code) {
    const existing = await clientService.getByCode(req.body.code);
    if (existing) {
      clientId = existing.id;
    }
  }

  const client = await clientService.update(clientId, req.body, adminId, ip);
  sendSuccess(res, client, 'Client updated successfully');
});

/**
 * Delete client
 * DELETE /clients/:id
 */
export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  await clientService.delete(req.params.id, adminId, ip);
  sendNoContent(res);
});

/**
 * Toggle client active status
 * PATCH /clients/:id/toggle-active
 */
export const toggleClientActive = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const client = await clientService.toggleActive(req.params.id, adminId, ip);
  sendSuccess(res, client, 'Client status updated');
});

/**
 * Get next available client code
 * GET /clients/next-code
 */
export const getNextCode = asyncHandler(async (req: Request, res: Response) => {
  const code = await clientService.getNextCode();
  sendSuccess(res, { code });
});
