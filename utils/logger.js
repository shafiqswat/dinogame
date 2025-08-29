// utils/logger.js - tiny logger
function now() { return new Date().toISOString(); }
module.exports = {
  info: (...args) => console.log('[INFO]', now(), ...args),
  warn: (...args) => console.warn('[WARN]', now(), ...args),
  error: (...args) => console.error('[ERROR]', now(), ...args),
  debug: (...args) => console.debug('[DEBUG]', now(), ...args)
};
