const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const ticketValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['Technical', 'Hardware', 'Access Request', 'Other'])
    .withMessage('Invalid category'),
  body('urgency').isIn(['Low', 'Medium', 'High']).withMessage('Invalid urgency'),
];

const statusValidation = [
  body('status')
    .isIn(['New', 'In Progress', 'Need Info', 'Resolved'])
    .withMessage('Invalid status'),
];

const messageValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
  ticketValidation,
  statusValidation,
  messageValidation,
};
