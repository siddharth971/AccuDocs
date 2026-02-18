
import 'reflect-metadata';
import '../main/container';
import { sequelize } from '../config/database.config';
import { initializeAssociations } from '../models';
import { logger } from '../utils/logger';

const rebuildDatabase = async () => {
  try {
    logger.info('🔄 Connecting to database...');
    await sequelize.authenticate();
    logger.info('✅ Connected.');

    logger.info('🗑️ Dropping and recreating all tables (force: true)...');

    // Initialize associations first so foreign keys are understood
    initializeAssociations();

    // Pass { force: true } to drop tables if they exist
    await sequelize.sync({ force: true });

    logger.info('✅ Database schema rebuilt successfully!');
    logger.info('You can now restart your server (npm run dev).');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to rebuild database:', error);
    process.exit(1);
  }
};

rebuildDatabase();
