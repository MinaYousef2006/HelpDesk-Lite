const pool = require('../config/db');

const generateTicketId = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT last_number FROM ticket_counter WHERE id = 1 FOR UPDATE'
    );

    const nextNumber = (rows[0]?.last_number || 1000) + 1;

    await connection.query(
      'UPDATE ticket_counter SET last_number = ? WHERE id = 1',
      [nextNumber]
    );

    await connection.commit();
    return `HD-${nextNumber}`;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const formatUser = (user) => {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const formatTicket = (ticket) => {
  return {
    id: ticket.id,
    ticket_id: ticket.ticket_id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    urgency: ticket.urgency,
    status: ticket.status,
    client_id: ticket.client_id,
    agent_id: ticket.agent_id,
    client_name: ticket.client_name,
    client_email: ticket.client_email,
    agent_name: ticket.agent_name,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
    resolved_at: ticket.resolved_at,
  };
};

module.exports = { generateTicketId, formatUser, formatTicket };
