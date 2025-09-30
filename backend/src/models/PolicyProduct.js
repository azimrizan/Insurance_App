const mongoose = require('mongoose');

// Product catalog for policies that users can purchase
const policyProductSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  premium: { type: Number, required: true },
  termMonths: { type: Number, default: 12 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('PolicyProduct', policyProductSchema);
