import { Sequelize, Options } from 'sequelize';
import { config } from './env.config';
import { logger } from '../utils/logger';

const dialect = 'postgres';

const sequelizeOptions: Options = {
  host: config.database.host,
  port: config.database.port,
  dialect: dialect,
  logging: false,
  pool: {
    max: config.database.pool.max,
    min: config.database.pool.min,
    acquire: config.database.pool.acquire,
    idle: config.database.pool.idle,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: false,
  },
  dialectOptions: {
    ssl: (config.nodeEnv === 'production' || (config.database as any).ssl) ? {
      require: true,
      rejectUnauthorized: false
    } : undefined,
  },
  timezone: '+00:00',
};

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  sequelizeOptions
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(`✅ Database connection established successfully via ${config.database.host}:${config.database.port}`);

    // In development, force modify the schema to match models
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synchronized');
    }
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('📴 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};
