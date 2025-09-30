const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  action: String,
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: Object,
  ip: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);
