
import { Router } from 'express';
import { AuthController } from './AuthController';

const router = Router();

router.post('/send-otp', AuthController.sendOtp);

export default router;
