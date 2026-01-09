import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleMySQL } from 'drizzle-orm/mysql2';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';

export * from './schema';

export type DatabaseType = 'postgres' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  type: DatabaseType;
  connection: unknown;
}

export function createDatabase(config: DatabaseConfig) {
  switch (config.type) {
    case 'postgres':
      return drizzlePostgres(config.connection as Parameters<typeof drizzlePostgres>[0]);
    
    case 'mysql':
      return drizzleMySQL(config.connection as Parameters<typeof drizzleMySQL>[0]);
    
    case 'sqlite':
      return drizzleSQLite(config.connection as Parameters<typeof drizzleSQLite>[0]);
    
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

export { sql, eq, and, or, not, gt, gte, lt, lte, like, ilike } from 'drizzle-orm';
