import { userRepository, otpRepository, logRepository, clientRepository } from '../repositories';
import { redisHelpers, config } from '../config';
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyRefreshToken,
  TokenPayload
} from '../utils';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  TooManyRequestsError
} from '../utils/errors';
import { whatsappService } from './whatsapp.service';
import { logger } from '../utils/logger';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    role: string;
  };
}

export const authService = {
  /**
   * Send OTP to a mobile number
   */
  async sendOTP(mobile: string, ip?: string): Promise<{ message: string; expiresIn: number }> {
    // Check rate limiting - max 5 OTPs per hour
    const recentCount = await otpRepository.getRecentCount(mobile, 60);
    if (recentCount >= 5) {
      throw new TooManyRequestsError('Too many OTP requests. Please try again later.');
    }

    // Generate OTP
    const otp = generateOTP(config.otp.length);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    // Store OTP
    await otpRepository.create({
      mobile,
      otpHash,
      expiresAt,
    });

    // Also store in Redis for faster access
    await redisHelpers.setOTP(mobile, otpHash, config.otp.expiryMinutes * 60);

    // Send OTP via WhatsApp
    try {
      await whatsappService.sendOTP(mobile, otp);
      logger.info(`OTP sent to ${mobile}`);
    } catch (error) {
      logger.error(`Failed to send OTP via WhatsApp: ${(error as Error).message}`);
      // In development, log the OTP for testing
      if (config.nodeEnv === 'development') {
        logger.debug(`Development OTP for ${mobile}: ${otp}`);
      }
    }

    // Log the action
    await logRepository.create({
      action: 'OTP_SENT',
      description: `OTP sent to ${mobile}`,
      ip,
    });

    return {
      message: 'OTP sent successfully',
      expiresIn: config.otp.expiryMinutes * 60,
    };
  },

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(mobile: string, otp: string, ip?: string, userAgent?: string): Promise<AuthResult> {
    // Check if max attempts reached
    const attempts = await redisHelpers.getOTPAttempts(mobile);
    if (attempts >= config.otp.maxAttempts) {
      throw new TooManyRequestsError('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Get OTP from database
    const storedOTP = await otpRepository.findByMobile(mobile);
    if (!storedOTP) {
      throw new BadRequestError('OTP expired or not found. Please request a new OTP.');
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, storedOTP.otpHash);
    if (!isValid) {
      await redisHelpers.incrementOTPAttempts(mobile);
      await otpRepository.incrementAttempts(storedOTP.id);
      throw new UnauthorizedError('Invalid OTP');
    }

    // Clean up OTP
    await otpRepository.deleteByMobile(mobile);
    await redisHelpers.deleteOTP(mobile);
    await redisHelpers.resetOTPAttempts(mobile);

    // Find or create user
    let user = await userRepository.findByMobile(mobile);
    if (!user) {
      // Check if there's a client with this mobile
      const client = await clientRepository.findAll({ search: mobile });
      if (client.clients.length > 0) {
        // Client exists, just get the user
        const clientData = client.clients[0];
        user = await userRepository.findById(clientData.userId);
      }

      if (!user) {
        throw new NotFoundError('User not found. Please contact administrator.');
      }
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      mobile: user.mobile,
      role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Store refresh token in Redis
    await redisHelpers.setRefreshToken(user.id, tokens.refreshToken, 7 * 24 * 60 * 60);

    // Log the action
    await logRepository.create({
      userId: user.id,
      action: 'LOGIN',
      description: `User logged in via OTP`,
      ip,
      userAgent,
    });

    logger.info(`User ${user.mobile} authenticated successfully`);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    };
  },

  /**
   * Admin login with password
   */
  async adminLogin(mobile: string, password: string, ip?: string, userAgent?: string): Promise<AuthResult> {
    logger.info(`Attempting admin login for mobile: '${mobile}'`);
    const user = await userRepository.findByMobile(mobile);

    if (!user) {
      logger.warn(`Admin login failed: User with mobile '${mobile}' not found`);
      throw new UnauthorizedError('Invalid credentials');
    }

    logger.debug(`User found: ${user.mobile}, Role: ${user.role}`);

    if (user.role !== 'admin') {
      logger.warn(`Admin login failed: User ${mobile} has role '${user.role}', not 'admin'`);
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.password) {
      logger.warn(`Admin login failed: User ${mobile} has no password set`);
      throw new UnauthorizedError('Password not set for this account');
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      logger.warn(`Admin login failed: Incorrect password for user ${mobile}`);
      await logRepository.create({
        userId: user.id,
        action: 'ACCESS_DENIED',
        description: 'Failed admin login attempt',
        ip,
        userAgent,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      mobile: user.mobile,
      role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Store refresh token
    await redisHelpers.setRefreshToken(user.id, tokens.refreshToken, 7 * 24 * 60 * 60);

    // Log the action
    await logRepository.create({
      userId: user.id,
      action: 'LOGIN',
      description: 'Admin logged in via password',
      ip,
      userAgent,
    });

    logger.info(`Admin ${user.mobile} logged in`);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Verify the refresh token matches what's stored
    const storedToken = await redisHelpers.getRefreshToken(decoded.userId);
    if (storedToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      mobile: decoded.mobile,
      role: decoded.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Update stored refresh token
    await redisHelpers.setRefreshToken(decoded.userId, tokens.refreshToken, 7 * 24 * 60 * 60);

    return tokens;
  },

  /**
   * Logout user
   */
  async logout(userId: string, ip?: string, userAgent?: string): Promise<void> {
    await redisHelpers.deleteRefreshToken(userId);

    await logRepository.create({
      userId,
      action: 'LOGOUT',
      description: 'User logged out',
      ip,
      userAgent,
    });

    logger.info(`User ${userId} logged out`);
  },

  /**
   * Change admin password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string, ip?: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new NotFoundError('Admin user not found');
    }

    if (!user.password) {
      throw new BadRequestError('No password set for this account');
    }

    const isValid = await verifyPassword(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });

    // Invalidate refresh token
    await redisHelpers.deleteRefreshToken(userId);

    await logRepository.create({
      userId,
      action: 'PASSWORD_CHANGED',
      description: 'Admin changed password',
      ip,
    });

    logger.info(`Password changed for user ${userId}`);
  },

  /**
   * Create admin user (for initial setup)
   */
  async createAdmin(name: string, mobile: string, password: string): Promise<void> {
    const existing = await userRepository.findByMobile(mobile);
    if (existing) {
      throw new BadRequestError('User with this mobile already exists');
    }

    const hashedPassword = await hashPassword(password);
    await userRepository.create({
      name,
      mobile,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    logger.info(`Admin user created: ${mobile}`);
  },
};
