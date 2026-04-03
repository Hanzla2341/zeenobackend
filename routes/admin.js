const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// POST /api/admin/login - Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, message: 'Login successful' });
});

// GET /api/admin/verify - Verify token
router.get('/verify', auth, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

module.exports = router;
