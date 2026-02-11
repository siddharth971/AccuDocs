import { Router } from 'express';
import { AuthController } from './AuthController';
import { otpLimiter, validateBody } from '../../../middlewares';
import { sendOTPSchema } from '../../../utils/validators';

const router = Router();

router.post('/send-otp', otpLimiter, validateBody(sendOTPSchema), AuthController.sendOtp);

export default router;
