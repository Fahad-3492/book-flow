const { body, validationResult } = require('express-validator');

// Runs after the body() validators below; turns validation failures
// into a clean 400 response instead of letting bad data hit the controller.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
}

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  handleValidation,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const createServiceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required.'),
  body('description').optional({ nullable: true }).trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number 0 or greater.'),
  body('durationMinutes')
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes.'),
  handleValidation,
];

// All fields optional on update — but if present, must still be valid.
const updateServiceValidation = [
  body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty.'),
  body('description').optional({ nullable: true }).trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number 0 or greater.'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false.'),
  handleValidation,
];

const createBookingValidation = [
  body('serviceId').isInt({ min: 1 }).withMessage('A valid service is required.'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM format (24-hour).'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  handleValidation,
];

const updateBookingStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed.'),
  handleValidation,
];

const setAvailabilityValidation = [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be 0-6 (Sunday-Saturday).'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('startTime must be in HH:MM format.'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('endTime must be in HH:MM format.')
    .custom((endTime, { req }) => endTime > req.body.startTime)
    .withMessage('endTime must be after startTime.'),
  handleValidation,
];

module.exports = {
  signupValidation,
  loginValidation,
  createServiceValidation,
  updateServiceValidation,
  createBookingValidation,
  updateBookingStatusValidation,
  setAvailabilityValidation,
  handleValidation,
};
