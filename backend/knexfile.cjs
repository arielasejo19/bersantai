require('dotenv').config();

const baseConnection = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'bersantai',
  user: process.env.DB_USER || 'bersantai',
  password: process.env.DB_PASSWORD || ''
};

module.exports = {
  development: {
    client: 'mysql2',
    connection: baseConnection,
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  },
  test: {
    client: 'mysql2',
    connection: baseConnection,
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    }
  }
};
