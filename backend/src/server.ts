import 'reflect-metadata';
import './main/container';
import { createApp } from './app';
import { config, validateConfig, connectDatabase, connectRedis, disconnectDatabase, disconnectRedis } from './config';
import { initializeAssociations } from './models';
import { logger } from './utils/logger';
import { authService, whatsappService, checklistService } from './services';
import { socketService } from './services/socket.service';

const startServer = async (): Promise<void> => {
  try {
    // Validate configuration
    validateConfig();
    logger.info('✅ Configuration validated');

    logger.info('🚀 Starting AccuDocs Server initialization...');
    // Restart to load folder configuration and services

    // Connect to database
    await connectDatabase();

    // Initialize model associations
    initializeAssociations();
    logger.info('✅ Model associations initialized');

    // Connect to Redis
    try {
      await connectRedis();
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, continuing without Redis');
    }

    // Create default admin user if none exists
    try {
      await authService.createAdmin('Admin', '9726153961', 'Admin@123');
      logger.info('✅ Default admin created');
    } catch (error) {
      // Admin already exists, which is fine
      logger.debug('Default admin already exists');
    }

    // Seed default checklist templates
    try {
      await checklistService.seedDefaultTemplates();
      logger.info('✅ Checklist templates ready');
    } catch (error) {
      logger.warn('⚠️ Failed to seed checklist templates:', error);
    }

    // Create and start Express app
    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`🚀 AccuDocs API server running on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`🔧 Environment: ${config.nodeEnv}`);

      // Initialize Socket.IO
      const origins = config.cors.origin.split(',').map(o => o.trim());
      socketService.initialize(server, origins);

      // Initialize WhatsApp client only when enabled.
      if (config.whatsapp.enabled) {
        whatsappService.initialize();
      } else {
        logger.info('⚠️ WhatsApp client initialization is disabled (WHATSAPP_ENABLED=false)');
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectDatabase();
          await disconnectRedis();
          await whatsappService.destroy();
          logger.info('✅ Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
