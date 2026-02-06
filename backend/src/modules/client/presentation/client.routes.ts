import { Router } from 'express';
import { container } from 'tsyringe';
import { ClientController } from './controllers/ClientController';
import { authenticate, adminOnly, validateBody, validateQuery } from '../../../middlewares';
import { createClientSchema, updateClientSchema, paginationSchema } from '../../../utils/validators';

// Register Dependencies
import { SequelizeClientRepository } from '../infrastructure/repositories/SequelizeClientRepository';
import { SequelizeUserRepository } from '../../auth/infrastructure/repositories/SequelizeUserRepository';

container.register("IClientRepository", { useClass: SequelizeClientRepository });
// container.register("IUserRepository", { useClass: SequelizeUserRepository }); 
// Note: IUserRepository might already be registered in Auth module or Global scope. 
// If not, we might duplicate registration. Safe to register if singleton not enforced strictly or lifecycle matches.
// For safety, let's assume one registry per App, but here for Route isolation we register what we need.
if (!container.isRegistered("IUserRepository")) {
  container.register("IUserRepository", { useClass: SequelizeUserRepository });
}

const router = Router();

router.use(authenticate, adminOnly);

router.post('/', validateBody(createClientSchema), ClientController.createClient);
router.get('/', validateQuery(paginationSchema), ClientController.getClients);
router.get('/next-code', ClientController.getNextCode);
router.get('/:id', ClientController.getClient);
router.put('/:id', validateBody(updateClientSchema), ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

export default router;
