const pool = require('../config/db');
const { generateTicketId, formatTicket } = require('../utils/helpers');

const TICKET_SELECT = `
  SELECT t.*,
    c.name AS client_name, c.email AS client_email,
    a.name AS agent_name
  FROM tickets t
  LEFT JOIN users c ON t.client_id = c.id
  LEFT JOIN users a ON t.agent_id = a.id
`;

const addStatusHistory = async (ticketId, oldStatus, newStatus, userId, note = null) => {
  await pool.query(
    'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
    [ticketId, oldStatus, newStatus, userId, note]
  );
};

const createTicket = async (req, res) => {
  try {
    const { title, description, category, urgency } = req.body;
    const ticketId = await generateTicketId();

    const [result] = await pool.query(
      `INSERT INTO tickets (ticket_id, title, description, category, urgency, status, client_id)
       VALUES (?, ?, ?, ?, ?, 'New', ?)`,
      [ticketId, title, description, category, urgency, req.user.id]
    );

    await addStatusHistory(result.insertId, null, 'New', req.user.id, 'Ticket created');

    const [tickets] = await pool.query(`${TICKET_SELECT} WHERE t.id = ?`, [result.insertId]);

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: formatTicket(tickets[0]),
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error creating ticket.' });
  }
};

const getTickets = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      urgency,
      sort = 'desc',
      page = 1,
      limit = 10,
      agent_id,
      client_id,
      unassigned,
      delayed,
    } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (req.user.role === 'Client') {
      where += ' AND t.client_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'Support_Agent') {
      if (unassigned === 'true') {
        where += ' AND t.agent_id IS NULL AND t.status != ?';
        params.push('Resolved');
      } else if (agent_id === 'me') {
        where += ' AND t.agent_id = ?';
        params.push(req.user.id);
      }
    }

    if (search) {
      where += ' AND (t.ticket_id LIKE ? OR t.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      where += ' AND t.status = ?';
      params.push(status);
    }

    if (category) {
      where += ' AND t.category = ?';
      params.push(category);
    }

    if (urgency) {
      where += ' AND t.urgency = ?';
      params.push(urgency);
    }

    if (client_id) {
      where += ' AND t.client_id = ?';
      params.push(client_id);
    }

    if (agent_id && agent_id !== 'me') {
      where += ' AND t.agent_id = ?';
      params.push(agent_id);
    }

    if (delayed === 'true') {
      where += " AND t.status NOT IN ('Resolved') AND t.created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)";
    }

    const sortOrder = sort === 'asc' ? 'ASC' : 'DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM tickets t ${where}`,
      params
    );

    const [tickets] = await pool.query(
      `${TICKET_SELECT} ${where} ORDER BY t.created_at ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      tickets: tickets.map(formatTicket),
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets.' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.query(
      `${TICKET_SELECT} WHERE t.id = ? OR t.ticket_id = ?`,
      [id, id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    if (req.user.role === 'Client' && ticket.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [messages] = await pool.query(
      `SELECT m.*, u.name AS user_name, u.role AS user_role
       FROM ticket_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticket.id]
    );

    const [history] = await pool.query(
      `SELECT h.*, u.name AS changed_by_name
       FROM ticket_status_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.ticket_id = ?
       ORDER BY h.created_at ASC`,
      [ticket.id]
    );

    const visibleMessages =
      req.user.role === 'Client'
        ? messages.filter((m) => !m.is_internal)
        : messages;

    res.json({
      ticket: formatTicket(ticket),
      messages: visibleMessages,
      statusHistory: history,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error fetching ticket.' });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;

    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ? OR ticket_id = ?', [id, id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = tickets[0];
    const assignTo = agent_id || req.user.id;

    if (req.user.role === 'Support_Agent' && !agent_id) {
      if (ticket.agent_id) {
        return res.status(400).json({ message: 'Ticket is already assigned.' });
      }
    }

    if (agent_id) {
      const [agents] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'Support_Agent'",
        [agent_id]
      );
      if (agents.length === 0) {
        return res.status(400).json({ message: 'Invalid agent.' });
      }
    }

    const oldStatus = ticket.status;
    const newStatus = oldStatus === 'New' ? 'In Progress' : oldStatus;

    await pool.query(
      'UPDATE tickets SET agent_id = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [assignTo, newStatus, ticket.id]
    );

    if (oldStatus !== newStatus) {
      await addStatusHistory(ticket.id, oldStatus, newStatus, req.user.id, 'Ticket assigned');
    }

    const [updated] = await pool.query(`${TICKET_SELECT} WHERE t.id = ?`, [ticket.id]);

    res.json({
      message: 'Ticket assigned successfully',
      ticket: formatTicket(updated[0]),
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error assigning ticket.' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['New', 'In Progress', 'Need Info', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ? OR ticket_id = ?', [id, id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    if (req.user.role === 'Support_Agent' && ticket.agent_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your assigned tickets.' });
    }

    const resolvedAt = status === 'Resolved' ? new Date() : null;

    await pool.query(
      'UPDATE tickets SET status = ?, resolved_at = ?, updated_at = NOW() WHERE id = ?',
      [status, resolvedAt, ticket.id]
    );

    await addStatusHistory(ticket.id, ticket.status, status, req.user.id, note || null);

    const [updated] = await pool.query(`${TICKET_SELECT} WHERE t.id = ?`, [ticket.id]);

    res.json({
      message: 'Status updated successfully',
      ticket: formatTicket(updated[0]),
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status.' });
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_internal = false } = req.body;

    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ? OR ticket_id = ?', [id, id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    if (req.user.role === 'Client') {
      if (ticket.client_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    } else if (req.user.role === 'Support_Agent') {
      if (ticket.agent_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only reply to your assigned tickets.' });
      }
    }

    const internal = req.user.role === 'Client' ? false : is_internal;

    const [result] = await pool.query(
      'INSERT INTO ticket_messages (ticket_id, user_id, message, is_internal) VALUES (?, ?, ?, ?)',
      [ticket.id, req.user.id, message, internal]
    );

    const [messages] = await pool.query(
      `SELECT m.*, u.name AS user_name, u.role AS user_role
       FROM ticket_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Message added successfully',
      data: messages[0],
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error adding message.' });
  }
};

const getClientStats = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status != 'Resolved' THEN 1 ELSE 0 END) AS open_tickets,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_tickets
       FROM tickets WHERE client_id = ?`,
      [req.user.id]
    );

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Client stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAgentStats = async (req, res) => {
  try {
    const agentId = req.user.id;

    const [newTickets] = await pool.query(
      "SELECT COUNT(*) AS count FROM tickets WHERE status = 'New' AND agent_id IS NULL"
    );

    const [activeTickets] = await pool.query(
      "SELECT COUNT(*) AS count FROM tickets WHERE agent_id = ? AND status NOT IN ('Resolved')",
      [agentId]
    );

    const [resolvedToday] = await pool.query(
      "SELECT COUNT(*) AS count FROM tickets WHERE agent_id = ? AND status = 'Resolved' AND DATE(resolved_at) = CURDATE()",
      [agentId]
    );

    const [avgResolution] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) AS avg_hours
       FROM tickets WHERE agent_id = ? AND status = 'Resolved' AND resolved_at IS NOT NULL`,
      [agentId]
    );

    res.json({
      stats: {
        new_tickets: newTickets[0].count,
        active_tickets: activeTickets[0].count,
        resolved_today: resolvedToday[0].count,
        avg_resolution_hours: Math.round(avgResolution[0].avg_hours || 0),
      },
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getManagerStats = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status NOT IN ('Resolved') THEN 1 ELSE 0 END) AS open_tickets,
        SUM(CASE WHEN status = 'Need Info' THEN 1 ELSE 0 END) AS need_info,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status NOT IN ('Resolved') AND created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR) THEN 1 ELSE 0 END) AS \`delayed\`
       FROM tickets`
    );

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Manager stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getTeamWorkload = async (req, res) => {
  try {
    const [workload] = await pool.query(
      `SELECT
        u.id, u.name,
        COUNT(t.id) AS assigned_tickets,
        SUM(CASE WHEN t.status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN t.status NOT IN ('Resolved') THEN 1 ELSE 0 END) AS active,
        AVG(CASE WHEN t.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, t.created_at, t.resolved_at) END) AS avg_hours
       FROM users u
       LEFT JOIN tickets t ON t.agent_id = u.id
       WHERE u.role = 'Support_Agent'
       GROUP BY u.id, u.name
       ORDER BY active DESC`
    );

    res.json({
      workload: workload.map((w) => ({
        ...w,
        avg_hours: Math.round(w.avg_hours || 0),
      })),
    });
  } catch (error) {
    console.error('Team workload error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  addMessage,
  getClientStats,
  getAgentStats,
  getManagerStats,
  getTeamWorkload,
};