import { Sequelize, Options } from 'sequelize';
import { config } from './env.config';
import { logger } from '../utils/logger';

const dialect = (process.env.DB_DIALECT as any) || 'mysql';
const storage = process.env.DB_STORAGE || './database.sqlite';

const sequelizeOptions: Options = {
  host: config.database.host,
  port: config.database.port,
  dialect: dialect,
  storage: dialect === 'sqlite' ? storage : undefined, // Only for SQLite
  logging: config.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
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
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  ...(dialect !== 'sqlite' && { timezone: '+05:30' }),
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
    logger.info('✅ Database connection established successfully');

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
