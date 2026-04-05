import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// In Cloudflare Pages, environment variables and bindings (like D1)
// are accessed via getRequestContext().env
export const getDb = (env: any) => {
  return drizzle(env.DB, { schema });
};
