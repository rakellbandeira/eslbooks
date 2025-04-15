const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');



// Client dashboard
router.get('/dashboard', authenticate, authorize('client'), dashboardController.getClientDashboard);

// Admin dashboard
router.get('/admin/dashboard', authenticate, authorize('admin'), dashboardController.getAdminDashboard);



module.exports = router;