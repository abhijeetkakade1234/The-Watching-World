import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  DB: Parameters<typeof drizzleD1>[0];
  GEMINI_API_KEY?: string;
  [key: string]: unknown; // Fallback for other potential bindings
}

/**
 * Cloudflare Pages environment-aware database getter.
 * Returns D1 driver in production, and Better-SQLite3 driver locally.
 */
export const getDb = (env: Env | undefined) => {
  if (env?.DB) {
    return drizzleD1(env.DB, { schema });
  }

  // Local Development (Node.js)
  // Using require here to prevent the Cloudflare Edge runtime from 
  // tries to bundle better-sqlite3, which is a native Node.js package.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle: drizzleLocal } = require('drizzle-orm/better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const sqlite = new Database('local_dev.db');
    return drizzleLocal(sqlite, { schema });
  } catch (_e) {
    throw new Error('Local database driver not found. Are you in a Cloudflare environment?');
  }
};
