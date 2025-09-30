const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPolicy', required: true },
  amount: { type: Number, required: true },
  method: { type: String },
  reference: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
