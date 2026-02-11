
import { sequelize } from '../config/database.config';
import { logger } from '../utils/logger';

const checkSchema = async () => {
  try {
    await sequelize.authenticate();
    console.log('Checking Schema...');

    const [results, metadata] = await sequelize.query("PRAGMA table_info(users);");
    console.log('Users Table Columns:', results);

    const [clientCols] = await sequelize.query("PRAGMA table_info(clients);");
    console.log('Clients Table Columns:', clientCols);

  } catch (err) {
    console.error(err);
  }
};

checkSchema();
