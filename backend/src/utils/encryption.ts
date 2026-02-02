import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Derive encryption key from the configured AES key
 */
const deriveKey = (salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(config.encryption.aesKey, salt, 100000, KEY_LENGTH, 'sha512');
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = (plaintext: string): string => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + encrypted data
  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  return combined.toString('base64');
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = (ciphertext: string): string => {
  const combined = Buffer.from(ciphertext, 'base64');

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

/**
 * Generate a random OTP
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

/**
 * Hash an OTP using bcrypt
 */
export const hashOTP = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Verify OTP against hash
 */
export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
