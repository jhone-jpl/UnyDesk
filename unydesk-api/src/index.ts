import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { ensureRedis } from './db/redis.js';
import { pool } from './db/pool.js';
import { ensureAdmin } from './seed.js';
import { authRoutes } from './routes/auth.js';
import { agentRoutes } from './routes/agent.js';
import { deviceRoutes } from './routes/devices.js';
import { userRoutes } from './routes/users.js';

async function main() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Agents often POST JSON as text/plain; accept both
  app.addContentTypeParser(
    'text/plain',
    { parseAs: 'string' },
    (_req, body, done) => {
      try {
        const json = body ? JSON.parse(String(body)) : {};
        done(null, json);
      } catch (e) {
        done(e as Error, undefined);
      }
    },
  );

  app.get('/health', async () => ({ ok: true, service: 'unydesk-api' }));

  await authRoutes(app);
  await agentRoutes(app);
  await deviceRoutes(app);
  await userRoutes(app);

  await pool.query('SELECT 1');
  await ensureRedis();
  await ensureAdmin();

  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`UnyDesk API listening on :${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
