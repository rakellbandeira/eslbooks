// Dashboard

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');

// Client dashboard
router.get('/dashboard', authenticate, authorize('client'), (req, res) => {
  res.render('dashboard/index', {
    title: 'Dashboard',
    user: req.user
  });
});

// Admin dashboard
router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    user: req.user
  });
});

module.exports = router;