import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ClientService } from '../../application/services/ClientService';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../../../utils/response';
import { asyncHandler } from '../../../../middlewares';

export class ClientController {

  static createClient = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    const client = await service.create(req.body, req.user!.userId);
    sendCreated(res, client, 'Client created successfully');
  });

  static getClients = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    const { search, page = 1, limit = 10, sortBy, sortOrder = 'desc' } = req.query;

    const { clients, total } = await service.getAll(
      { search: search as string },
      { page: Number(page), limit: Number(limit), sortBy: sortBy as string, sortOrder: sortOrder as any }
    );
    sendPaginated(res, clients, Number(page), Number(limit), total);
  });

  static getClient = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    const client = await service.getById(req.params.id);
    sendSuccess(res, client);
  });

  static updateClient = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    let clientId = req.params.id;
    // Manual patch from legacy
    /*
    if (clientId === 'null' && req.body.code) {
        // ... handled in legacy ...
    }
    */

    const client = await service.update(clientId, req.body, req.user!.userId);
    sendSuccess(res, client, 'Client updated successfully');
  });

  static deleteClient = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    await service.delete(req.params.id);
    sendNoContent(res);
  });

  static getNextCode = asyncHandler(async (req: Request, res: Response) => {
    const service = container.resolve(ClientService);
    const code = await service.getNextCode();
    sendSuccess(res, { code });
  });
}
