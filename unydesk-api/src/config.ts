import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 21114),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://unydesk:unydesk@127.0.0.1:5432/unydesk',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'unydesk-dev-secret-change-me',
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'UnyDesk!admin',
  onlineThresholdSec: Number(process.env.ONLINE_THRESHOLD_SEC || 45),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
