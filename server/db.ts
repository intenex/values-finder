import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle(sql, { schema });

export type Database = typeof db;
