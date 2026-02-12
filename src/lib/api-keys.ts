import crypto from 'crypto';

/**
 * Generates a random secure API key with a prefix
 * Example: bz_live_...
 */
export function generateAPIKey() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `bz_live_${randomBytes}`;
}

/**
 * Hashes the API key using SHA-256
 */
export function hashKey(key: string) {
  return crypto.createHash('sha256').update(key).digest('hex');
}