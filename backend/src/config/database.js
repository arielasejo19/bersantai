import knex from 'knex';
import { env, hasDatabaseConfig } from './env.js';

let db;

export function getDatabase() {
  if (!hasDatabaseConfig()) {
    return null;
  }

  if (!db) {
    db = knex({
      client: 'mysql2',
      connection: {
        host: env.db.host,
        port: env.db.port,
        database: env.db.database,
        user: env.db.user,
        password: env.db.password
      },
      pool: {
        min: 0,
        max: 10
      }
    });
  }

  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.destroy();
    db = null;
  }
}
