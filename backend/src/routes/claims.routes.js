const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const claimsCtrl = require('../controllers/claims.controller');

router.post('/', auth, claimsCtrl.submit);
router.get('/', auth, claimsCtrl.list);
router.get('/:id', auth, claimsCtrl.getById);
router.put('/:id/status', auth, role(['agent','admin']), claimsCtrl.updateStatus);

module.exports = router;
