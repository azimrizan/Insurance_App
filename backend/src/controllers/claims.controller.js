const Claim = require('../models/Claim');
const UserPolicy = require('../models/UserPolicy');
const { log } = require('../utils/audit');

exports.submit = async (req, res) => {
  const { policyId, incidentDate, description, amount } = req.body;
  const userPolicy = await UserPolicy.findById(policyId);
  if (!userPolicy) return res.status(404).json({ message: 'UserPolicy not found' });
  if (!userPolicy.userId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
  const claim = await Claim.create({ userId: req.user._id, userPolicyId: userPolicy._id, incidentDate, description, amountClaimed: amount });
  await log('claim.submit', req.user._id, { claimId: claim._id });
  res.status(201).json(claim);
};

exports.list = async (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'agent') {
    const items = await Claim.find().populate('userPolicyId').populate('userId');
    return res.json(items);
  }
  const items = await Claim.find({ userId: req.user._id }).populate('userPolicyId');
  res.json(items);
};

exports.getById = async (req, res) => {
  const c = await Claim.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  if (!c.userId.equals(req.user._id) && req.user.role === 'customer') return res.status(403).json({ message: 'Forbidden' });
  res.json(c);
};

exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ message: 'Not found' });
  claim.status = status;
  claim.decisionNotes = notes || claim.decisionNotes;
  claim.decidedByAgentId = req.user._id;
  await claim.save();
  await log('claim.updateStatus', req.user._id, { claimId: claim._id, status });
  res.json(claim);
};
