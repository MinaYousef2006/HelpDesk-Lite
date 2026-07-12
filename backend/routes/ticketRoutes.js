const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ticketValidation, statusValidation, messageValidation } = require('../models/validators');

router.use(authenticate);

router.post('/', authorize('Client'), ticketValidation, validate, createTicket);
router.get('/', getTickets);
router.get('/stats/client', authorize('Client'), getClientStats);
router.get('/stats/agent', authorize('Support_Agent'), getAgentStats);
router.get('/stats/manager', authorize('Manager'), getManagerStats);
router.get('/team-workload', authorize('Manager'), getTeamWorkload);
router.get('/:id', getTicketById);
router.post('/:id/assign', authorize('Support_Agent', 'Manager'), assignTicket);
router.patch('/:id/status', authorize('Support_Agent', 'Manager'), statusValidation, validate, updateStatus);
router.post('/:id/messages', messageValidation, validate, addMessage);

module.exports = router;
