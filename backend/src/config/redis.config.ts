import Redis from 'ioredis';
import { config } from './env.config';
import { logger } from '../utils/logger';

// Mock Redis implementation for local development
class MockRedis {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    logger.info('⚠️ Using In-Memory Mock Redis');
  }

  on(event: string, callback: (...args: any[]) => void): this {
    if (event === 'connect') {
      setTimeout(callback, 100);
    }
    return this;
  }

  async connect(): Promise<void> {
    logger.info('✅ Mock Redis connection established');
  }

  async quit(): Promise<string> {
    return 'OK';
  }

  async set(key: string, value: string): Promise<string> {
    this.store.set(key, value);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    if (this.expirations.has(key)) {
      clearTimeout(this.expirations.get(key)!);
      this.expirations.delete(key);
    }
    return existed ? 1 : 0;
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.store.set(key, value);
    this.setExpiration(key, seconds);
    return 'OK';
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key) || '0', 10);
    const next = current + 1;
    this.store.set(key, String(next));
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.store.has(key)) {
      this.setExpiration(key, seconds);
      return 1;
    }
    return 0;
  }

  private setExpiration(key: string, seconds: number) {
    if (this.expirations.has(key)) {
      clearTimeout(this.expirations.get(key)!);
    }
    const timeout = setTimeout(() => {
      this.store.delete(key);
      this.expirations.delete(key);
    }, seconds * 1000);
    this.expirations.set(key, timeout);
  }
}

// Check if Redis is enabled
const isRedisEnabled = process.env.REDIS_ENABLED !== 'false';

export const redis = isRedisEnabled
  ? new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  })
  : (new MockRedis() as any as Redis);

if (isRedisEnabled) {
  redis.on('connect', () => {
    logger.info('✅ Redis client connected');
  });

  redis.on('error', (err) => {
    logger.error('❌ Redis client error:', err);
  });

  redis.on('reconnecting', () => {
    logger.warn('🔄 Redis client reconnecting...');
  });
}

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    // logger info is handled inside Mock or by event listener
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    // Don't throw if using mock, but mock.connect shouldn't fail
    if (isRedisEnabled) throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    logger.info('📴 Redis connection closed');
  } catch (error) {
    logger.error('❌ Error closing Redis connection:', error);
  }
};

// Redis helpers
export const redisHelpers = {
  async setOTP(mobile: string, otpHash: string, expirySeconds: number): Promise<void> {
    const key = `otp:${mobile}`;
    await redis.setex(key, expirySeconds, otpHash);
  },

  async getOTP(mobile: string): Promise<string | null> {
    const key = `otp:${mobile}`;
    return redis.get(key);
  },

  async deleteOTP(mobile: string): Promise<void> {
    const key = `otp:${mobile}`;
    await redis.del(key);
  },

  async incrementOTPAttempts(mobile: string): Promise<number> {
    const key = `otp_attempts:${mobile}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 300); // 5 minutes
    return attempts;
  },

  async getOTPAttempts(mobile: string): Promise<number> {
    const key = `otp_attempts:${mobile}`;
    const attempts = await redis.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  },

  async resetOTPAttempts(mobile: string): Promise<void> {
    const key = `otp_attempts:${mobile}`;
    await redis.del(key);
  },

  async setRefreshToken(userId: string, token: string, expirySeconds: number): Promise<void> {
    const key = `refresh_token:${userId}`;
    await redis.setex(key, expirySeconds, token);
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return redis.get(key);
  },

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await redis.del(key);
  },

  async setWhatsAppSession(mobile: string, sessionData: object, expirySeconds: number): Promise<void> {
    const key = `whatsapp_session:${mobile}`;
    await redis.setex(key, expirySeconds, JSON.stringify(sessionData));
  },

  async getWhatsAppSession(mobile: string): Promise<object | null> {
    const key = `whatsapp_session:${mobile}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async deleteWhatsAppSession(mobile: string): Promise<void> {
    const key = `whatsapp_session:${mobile}`;
    await redis.del(key);
  },

  async setTelegramSession(chatId: string, sessionData: object, expirySeconds: number = 1800): Promise<void> {
    const key = `telegram:session:${chatId}`;
    await redis.setex(key, expirySeconds, JSON.stringify(sessionData));
  },

  async getTelegramSession(chatId: string): Promise<object | null> {
    const key = `telegram:session:${chatId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async deleteTelegramSession(chatId: string): Promise<void> {
    const key = `telegram:session:${chatId}`;
    await redis.del(key);
  },
};
