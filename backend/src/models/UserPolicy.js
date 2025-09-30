const mongoose = require('mongoose');

const userPolicySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'PolicyProduct', required: true },
  startDate: Date,
  endDate: Date,
  premiumPaid: Number,
  status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'], default: 'ACTIVE' },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nominee: { name: String, relation: String },
}, { timestamps: true });

module.exports = mongoose.model('UserPolicy', userPolicySchema);
