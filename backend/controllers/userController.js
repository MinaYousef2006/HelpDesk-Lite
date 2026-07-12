const pool = require('../config/db');
const { formatUser } = require('../utils/helpers');

const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (role) {
      where += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params
    );

    const [users] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      users: users.map(formatUser),
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

const getAgents = async (req, res) => {
  try {
    const [agents] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'Support_Agent' ORDER BY name"
    );

    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getUsers, getAgents };
