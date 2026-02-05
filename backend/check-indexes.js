// Using Sequelize to check SQLite indexes
const { Sequelize } = require('sequelize');
const path = require('path');

async function checkIndexes() {
  const db = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  const [indexes] = await db.query("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='users'");
  console.log('Indexes on users table:');
  console.log(JSON.stringify(indexes, null, 2));

  const [schema] = await db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
  console.log('\nUsers table schema:');
  console.log(JSON.stringify(schema, null, 2));

  await db.close();
}

checkIndexes().catch(console.error);
