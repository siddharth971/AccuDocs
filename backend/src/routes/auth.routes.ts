import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, validateBody, authLimiter, otpLimiter, adminOnly } from '../middlewares';
import { sendOTPSchema, verifyOTPSchema, adminLoginSchema, refreshTokenSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to mobile number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', otpLimiter, validateBody(sendOTPSchema), authController.sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - otp
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 */
router.post('/verify-otp', authLimiter, validateBody(verifyOTPSchema), authController.verifyOTP);

/**
 * @swagger
 * /auth/admin-login:
 *   post:
 *     summary: Admin login with password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - password
 *             properties:
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/admin-login', authLimiter, validateBody(adminLoginSchema), authController.adminLogin);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', validateBody(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change admin password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post(
  '/change-password',
  authenticate,
  adminOnly,
  validateBody(
    z.object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(8),
    })
  ),
  authController.changePassword
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/me', authenticate, authController.getProfile);

export default router;
