const express = require('express');
const router = express.Router();
const {
  register,
  login,
  fastorRegister,
  fastorLogin,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/fastor-register', fastorRegister);
router.post('/fastor-login', fastorLogin);
router.get('/me', protect, getMe);

module.exports = router;

