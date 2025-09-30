const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const adminCtrl = require('../controllers/admin.controller');

// 🔹 Admin-only routes
router.get('/audit', auth, role('admin'), adminCtrl.audit);
router.get('/summary', auth, role('admin'), adminCtrl.summary);
router.get('/users', auth, role('admin'), adminCtrl.listUsers);

// 🔹 Agent management
router.get('/agents', auth, role('admin'), adminCtrl.listAgents);
router.post('/agents', auth, role('admin'), adminCtrl.createAgent);
router.put('/agents/:id/assign', auth, role('admin'), adminCtrl.assignAgent);

module.exports = router;
