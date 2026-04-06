import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

type D1Env = {
  DB: Parameters<typeof drizzle>[0];
};

// In Cloudflare Pages, environment variables and bindings (like D1)
// are accessed via getRequestContext().env
export const getDb = (env: D1Env) => {
  return drizzle(env.DB, { schema });
};
