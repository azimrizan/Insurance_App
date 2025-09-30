const PolicyProduct = require('../models/PolicyProduct');
const UserPolicy = require('../models/UserPolicy');
const { log } = require('../utils/audit');

exports.listPublic = async (req, res) => {
  const items = await PolicyProduct.find();
  res.json(items);
};

exports.getById = async (req, res) => {
  const p = await PolicyProduct.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

exports.createPolicy = async (req, res) => {
  try {
    const { code, title, description, premium, termMonths } = req.body;

    if (!code || !title || !premium || !termMonths) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if policy code already exists
    const existingPolicy = await PolicyProduct.findOne({ code });
    if (existingPolicy) {
      return res.status(409).json({ message: 'Policy code already exists' });
    }

    const newPolicy = await PolicyProduct.create({
      code,
      title,
      description,
      premium,
      termMonths,
    });

    res.status(201).json(newPolicy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.purchase = async (req, res) => {
  const user = req.user;
  const policyId = req.params.id;
  const { startDate, termMonths, nominee } = req.body;
  const product = await PolicyProduct.findById(policyId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const sd = startDate ? new Date(startDate) : new Date();
  const tm = termMonths || product.termMonths || 12;
  const endDate = new Date(sd);
  endDate.setMonth(endDate.getMonth() + tm);
  const userPolicy = await UserPolicy.create({
    userId: user._id,
    policyProductId: product._id,
    startDate: sd,
    endDate,
    premiumPaid: product.premium * tm,
    nominee: nominee || {},
    status: 'ACTIVE'
  });
  await log('policy.purchase', user._id, { userPolicyId: userPolicy._id, productId: product._id });
  res.status(201).json(userPolicy);
};

exports.myPolicies = async (req, res) => {
  const policies = await UserPolicy.find({ userId: req.user._id }).populate('policyProductId');
  res.json(policies);
};

exports.cancelPolicy = async (req, res) => {
  const id = req.params.id;
  const userPolicy = await UserPolicy.findById(id);
  if (!userPolicy) return res.status(404).json({ message: 'Not found' });
  if (!userPolicy.userId.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  userPolicy.status = 'CANCELLED';
  await userPolicy.save();
  await log('policy.cancel', req.user._id, { userPolicyId: id });
  res.json(userPolicy);
};

exports.deletePolicy = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    const deleted = await PolicyProduct.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    await log('policy.delete', req.user._id, { policyProductId: id });
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    console.error('Delete policy error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
