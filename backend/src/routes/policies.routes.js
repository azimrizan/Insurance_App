const express = require('express');
const router = express.Router();
const policiesCtrl = require('../controllers/policies.controller');
const auth = require('../middlewares/auth.middleware');

// Specific routes first to avoid conflicts
router.get('/user/me', auth, policiesCtrl.myPolicies);
router.put('/user/:id/cancel', auth, policiesCtrl.cancelPolicy);

// Aliases requested: list/cancel via /user/policies and /user/policies/:id/cancle
router.get('/user/policies', auth, policiesCtrl.myPolicies);
router.put('/user/policies/:id/cancle', auth, policiesCtrl.cancelPolicy);

// Public product catalog
router.get('/', policiesCtrl.listPublic);
router.get('/:id', policiesCtrl.getById);

// Admin create/delete product and user purchase
router.post('/', auth, policiesCtrl.createPolicy);
router.delete('/:id', auth, policiesCtrl.deletePolicy);
router.post('/:id/purchase', auth, policiesCtrl.purchase);

module.exports = router;
