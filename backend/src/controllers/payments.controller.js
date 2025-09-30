const Payment = require('../models/Payment');
const { log } = require('../utils/audit');

exports.record = async (req, res) => {
  const { policyId, amount, method, reference } = req.body;
  const p = await Payment.create({ userId: req.user._id, userPolicyId: policyId, amount, method, reference });
  await log('payment.record', req.user._id, { paymentId: p._id });
  res.status(201).json(p);
};

exports.forUser = async (req, res) => {
  const items = await Payment.find({ userId: req.user._id });
  res.json(items);
};
