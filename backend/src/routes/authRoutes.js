const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validators');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', requireAuth, getMe);

module.exports = router;
