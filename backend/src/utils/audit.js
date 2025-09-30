const AuditLog = require('../models/AuditLog');

async function log(action, actorId, details = {}, ip = '') {
  try {
    await AuditLog.create({ action, actorId, details, ip });
  } catch (e) { console.warn('Audit error', e); }
}

module.exports = { log };
