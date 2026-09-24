import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'bersantai_session',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER?.trim(),
    password: process.env.SMTP_PASSWORD?.replace(/\s+/g, ''),
    from: process.env.SMTP_FROM || process.env.SMTP_USER
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  ,socialAuthDevMode: process.env.SOCIAL_AUTH_DEV_MODE === 'true' || (process.env.NODE_ENV || 'development') !== 'production'
};

export function hasDatabaseConfig() {
  return Boolean(env.db.host && env.db.database && env.db.user);
}

export function hasSmtpConfig() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.password && env.smtp.from);
}
