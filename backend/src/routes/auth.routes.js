const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authCtrl.register);

router.post('/login', authCtrl.login);

router.get('/me', require('../middlewares/auth.middleware'), authCtrl.me);

module.exports = router;
