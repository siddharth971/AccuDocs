import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './controllers/UserController';
import { authenticate, adminOnly, validateBody, validateQuery } from '../../../middlewares';
import { createUserSchema, updateUserSchema, paginationSchema } from '../../../utils/validators';
import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository';

// Register Dependencies for this module
if (!container.isRegistered("IUserRepository")) {
  container.register("IUserRepository", { useClass: SequelizeUserRepository });
}

const router = Router();
const userController = container.resolve(UserController);

router.use(authenticate, adminOnly);

router.post('/', validateBody(createUserSchema), (req, res, next) => userController.createUser(req, res, next));
router.get('/', validateQuery(paginationSchema), (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.put('/:id', validateBody(updateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
