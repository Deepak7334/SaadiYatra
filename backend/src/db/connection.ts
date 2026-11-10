import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

export type DrizzleDb = ReturnType<typeof drizzleD1<typeof schema>>;

export function getDb(d1: D1Database): DrizzleDb {
  return drizzleD1(d1, { schema });
}
