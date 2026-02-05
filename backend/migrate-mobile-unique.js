// Migration script to remove UNIQUE constraint from mobile column
const { Sequelize } = require('sequelize');
const path = require('path');

async function migrate() {
  const db = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: console.log
  });

  console.log('Starting migration to remove UNIQUE constraint from mobile column...\n');

  try {
    // Disable foreign keys
    console.log('0. Disabling foreign key checks...');
    await db.query('PRAGMA foreign_keys = OFF');

    // Start transaction
    await db.query('BEGIN TRANSACTION');

    // 1. Create new users table without UNIQUE on mobile
    console.log('1. Creating new users_new table without UNIQUE constraint on mobile...');
    await db.query(`
      CREATE TABLE users_new (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password VARCHAR(255),
        role VARCHAR(255) DEFAULT 'client' NOT NULL,
        is_active TINYINT(1) DEFAULT 1 NOT NULL,
        last_login DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    // 2. Copy all data from old table
    console.log('2. Copying data from old users table...');
    await db.query(`
      INSERT INTO users_new (id, name, mobile, password, role, is_active, last_login, created_at, updated_at)
      SELECT id, name, mobile, password, role, is_active, last_login, created_at, updated_at FROM users
    `);

    // 3. Drop old table
    console.log('3. Dropping old users table...');
    await db.query('DROP TABLE users');

    // 4. Rename new table to users
    console.log('4. Renaming users_new to users...');
    await db.query('ALTER TABLE users_new RENAME TO users');

    // 5. Create non-unique indexes
    console.log('5. Creating indexes...');
    await db.query('CREATE INDEX users_mobile ON users (mobile)');
    await db.query('CREATE INDEX users_role ON users (role)');
    await db.query('CREATE INDEX users_is_active ON users (is_active)');

    // Commit transaction
    await db.query('COMMIT');

    // Re-enable foreign keys
    console.log('6. Re-enabling foreign key checks...');
    await db.query('PRAGMA foreign_keys = ON');

    console.log('\n✅ Migration completed successfully!');
    console.log('Mobile column no longer has UNIQUE constraint.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    await db.query('ROLLBACK');
    await db.query('PRAGMA foreign_keys = ON');
    throw error;
  } finally {
    await db.close();
  }
}

migrate().catch(console.error);
