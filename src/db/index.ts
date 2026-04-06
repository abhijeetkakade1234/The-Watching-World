import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  DB?: Parameters<typeof drizzleD1>[0];
  GEMINI_API_KEY?: string;
  [key: string]: unknown;
}

export const getDb = (env: Env | undefined) => {
  if (!env?.DB) {
    throw new Error('D1 Database [DB] binding is missing');
  }
  return drizzleD1(env.DB, { schema });
};
