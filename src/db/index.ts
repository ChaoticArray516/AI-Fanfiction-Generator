/**
 * Database Connection
 *
 * Drizzle ORM database connection using PostgreSQL
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable SSL for production databases like Neon
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

// Create Drizzle DB instance
export const db = drizzle(pool);

// Export for direct access if needed
export { pool };
