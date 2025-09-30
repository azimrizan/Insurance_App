const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const paymentsCtrl = require('../controllers/payments.controller');

router.post('/', auth, paymentsCtrl.record);
router.get('/user', auth, paymentsCtrl.forUser);

module.exports = router;
