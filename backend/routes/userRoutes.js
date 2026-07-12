const express = require('express');
const router = express.Router();
const { getUsers, getAgents } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('Manager'), getUsers);
router.get('/agents', authorize('Manager', 'Support_Agent'), getAgents);

module.exports = router;
