
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'accudocs',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('Testing connection with config:', { ...config, password: '****' });

const client = new Client(config);

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    const res = await client.query('SELECT NOW()');
    console.log('Database Time:', res.rows[0]);
    await client.end();
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    if (err.code === '3D000') {
      console.error('--> HINT: The database "' + config.database + '" does not exist.');
      console.error('    Try creating it with: createdb -U ' + config.user + ' ' + config.database);
    } else if (err.code === '28P01') {
      console.error('--> HINT: Authentication failed. Check your DB_USER and DB_PASSWORD in .env');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('--> HINT: Could not connect to PostgreSQL. Is the service running on port ' + config.port + '?');
    }
    console.error('Full Error:', err);
    process.exit(1);
  }
}

testConnection();
