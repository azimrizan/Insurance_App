const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const UserPolicy = require('../models/UserPolicy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

// 🔹 Audit logs
exports.audit = async (req, res) => {
  try {
    const items = await AuditLog.find().populate('actorId', 'name email').sort({ timestamp: -1 }).limit(100);
    // Normalize to include actorName for frontend convenience
    const mapped = items.map(i => ({
      _id: i._id,
      action: i.action,
      userId: i.actorId?._id || i.actorId, // keep original id
      userName: i.actorId?.name || null,
      details: i.details,
      ip: i.ip,
      timestamp: i.timestamp
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Admin audit error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

// 🔹 Summary data
exports.summary = async (req, res) => {
  try {
    const [users, policiesSold, claimsPending, totalPayments] = await Promise.all([
      User.countDocuments(),
      UserPolicy.countDocuments({ status: 'ACTIVE' }),
      Claim.countDocuments({ status: 'PENDING' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    res.json({ 
      users, 
      policiesSold, 
      claimsPending, 
      totalPayments: (totalPayments[0] && totalPayments[0].total) || 0 
    });
  } catch (err) {
    console.error('Admin summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary', details: err.message });
  }
};

// 🔹 List all users (basic fields, optional search)
exports.listUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const baseRoleFilter = { role: { $nin: ['admin', 'agent'] } }; // customers only
    const filter = q
      ? { $and: [
            baseRoleFilter,
            { $or: [
              { name: { $regex: q, $options: 'i' } },
              { email: { $regex: q, $options: 'i' } }
            ] }
          ] }
      : baseRoleFilter;
    const users = await User.find(filter, '_id name email role').sort({ name: 1 }).limit(1000);
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// 🔹 List all agents
exports.listAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' });
    res.json(agents);
  } catch (err) {
    console.error('List agents error:', err);
    res.status(500).json({ error: 'Failed to fetch agents', details: err.message });
  }
};

// 🔹 Create new agent (hash password)
exports.createAgent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAgent = new User({ 
      name, 
      email, 
      passwordHash, 
      role: role || 'agent' 
    });

    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    console.error('Create agent error:', err);
    res.status(500).json({ error: 'Failed to create agent', details: err.message });
  }
};

// 🔹 Assign user to agent
exports.assignAgent = async (req, res) => {
  try {
    const { id } = req.params; // agent id
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const agent = await User.findById(id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    agent.assignedUsers = agent.assignedUsers || [];
    if (!agent.assignedUsers.includes(userId)) {
      agent.assignedUsers.push(userId);
      await agent.save();
    }

    res.json({ message: `User ${userId} assigned to agent ${id}` });
  } catch (err) {
    console.error('Assign agent error:', err);
    res.status(500).json({ error: 'Failed to assign user to agent', details: err.message });
  }
};
