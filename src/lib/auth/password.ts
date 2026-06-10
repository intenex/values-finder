import bcrypt from "bcryptjs";

// Existing accounts were hashed with native bcrypt at cost 10 ($2b$).
// bcryptjs verifies those hashes byte-for-byte; new accounts get cost 12.
const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Normalize the rare $2y$ (PHP) prefix, which bcryptjs does not accept.
  const normalized = hash.startsWith("$2y$") ? "$2b$" + hash.slice(4) : hash;
  return bcrypt.compare(password, normalized);
}
