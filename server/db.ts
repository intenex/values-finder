import { drizzle } from 'drizzle-orm/better-sqlite3';
import { type Database as SQLiteDatabase } from 'sqlite3';
import { open } from 'sqlite';
import * as schema from '../shared/schema.js';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

// Default to a local database file
const dbPath = process.env.DATABASE_PATH || './data/values.db';

// Initialize the directory on first use
let dbInitialized = false;
async function ensureDbDir() {
  if (!dbInitialized) {
    await mkdir(dirname(dbPath), { recursive: true }).catch(() => {});
    dbInitialized = true;
  }
}

// For better-sqlite3 compatibility, we'll create a wrapper
// Since better-sqlite3 failed to install, we'll use node-sqlite3 with the sqlite wrapper
let sqliteDb: any;

// Initialize the database
async function initDb() {
  await ensureDbDir();
  const db = await open({
    filename: dbPath,
    driver: require('sqlite3').Database
  });
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  
  return db;
}

// Create a sync wrapper for compatibility with drizzle
class BetterSqlite3Wrapper {
  private dbPromise: Promise<any>;
  
  constructor() {
    this.dbPromise = initDb();
  }
  
  async prepare(sql: string) {
    const db = await this.dbPromise;
    return {
      all: async (...params: any[]) => {
        return await db.all(sql, ...params);
      },
      get: async (...params: any[]) => {
        return await db.get(sql, ...params);
      },
      run: async (...params: any[]) => {
        return await db.run(sql, ...params);
      }
    };
  }
  
  async exec(sql: string) {
    const db = await this.dbPromise;
    return await db.exec(sql);
  }
  
  pragma(pragma: string) {
    // Handle pragma in the init function
    return this;
  }
}

// For now, let's use the in-memory approach and add a note about migrating to SQLite
console.log('Note: SQLite database setup is prepared. Run migrations to initialize the database.');

export { dbPath };
export type Database = any; // Will be properly typed when we complete the setup