import { Request, Response } from 'express';
import { authService } from '../services';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares';

/**
 * Send OTP to mobile number
 * POST /auth/send-otp
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  const result = await authService.sendOTP(mobile, ip);
  sendSuccess(res, result, 'OTP sent successfully');
});

/**
 * Verify OTP and login
 * POST /auth/verify-otp
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await authService.verifyOTP(mobile, otp, ip, userAgent);
  sendSuccess(res, result, 'Authentication successful');
});

/**
 * Admin login with password
 * POST /auth/admin-login
 */
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await authService.adminLogin(mobile, password, ip, userAgent);
  sendSuccess(res, result, 'Login successful');
});

/**
 * Refresh access token
 * POST /auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);
  sendSuccess(res, tokens, 'Token refreshed successfully');
});

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  await authService.logout(userId, ip, userAgent);
  sendSuccess(res, null, 'Logged out successfully');
});

/**
 * Change admin password
 * POST /auth/change-password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { oldPassword, newPassword } = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  await authService.changePassword(userId, oldPassword, newPassword, ip);
  sendSuccess(res, null, 'Password changed successfully');
});

/**
 * Get current user profile
 * GET /auth/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId, mobile, role } = req.user!;

  sendSuccess(res, {
    userId,
    mobile,
    role,
  }, 'Profile retrieved successfully');
});
