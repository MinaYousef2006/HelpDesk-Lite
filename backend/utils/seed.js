const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const seedUsers = [
  { name: 'Sarah Johnson', email: 'sarah.agent@helpdesk.com', role: 'Support_Agent' },
  { name: 'Mike Chen', email: 'mike.agent@helpdesk.com', role: 'Support_Agent' },
  { name: 'Emily Davis', email: 'emily.manager@helpdesk.com', role: 'Manager' },
];

const seed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'helpdesk_lite',
  });

  try {
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 10);

    for (const user of seedUsers) {
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hash, user.role]
        );
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    console.log('\nSeed complete. Default password for all seed users: Password123!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await connection.end();
  }
};

seed();
