/**
 * Passwords for demo/seed accounts come from env. Outside production a
 * dev-only default is used so `prisma db seed` works without extra setup.
 * In production the env var is required: a public repo must not ship the
 * password of a working admin account.
 */
export function seedPassword(envVar: string, devDefault: string): string {
  const value = process.env[envVar];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envVar} is required to seed demo accounts in production`);
  }
  return devDefault;
}
