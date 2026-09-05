import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

function likeParam(v: string | undefined) {
  if (!v || v === '-') return null;
  return v.includes('%') ? v : `%${v}%`;
}

export async function userRoutes(app: FastifyInstance) {
  app.get('/api/users', { preHandler: requireAuth }, async (request) => {
    const q = request.query as Record<string, string | undefined>;
    const pageSize = Math.min(Number(q.pageSize || 30), 200);
    const current = Math.max(Number(q.current || 1), 1);
    const offset = (current - 1) * pageSize;
    const params: unknown[] = [];
    const filters: string[] = [];
    const name = likeParam(q.name);
    if (name) {
      params.push(name);
      filters.push(`name ILIKE $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const total = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users ${where}`,
      params,
    );
    params.push(pageSize, offset);
    const { rows } = await query(
      `SELECT guid, name, email, display_name, note, status, is_admin, created_at
       FROM users ${where}
       ORDER BY name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return {
      data: rows.map((u) => ({
        ...u,
        info: { email_verification: false, email_alarm_notification: false },
      })),
      total: Number(total.rows[0]?.count || 0),
    };
  });

  app.post('/api/users', { preHandler: requireAdmin }, async (request, reply) => {
    const body = z
      .object({
        name: z.string().min(1),
        password: z.string().min(6),
        email: z.string().email().optional().nullable(),
        note: z.string().optional().nullable(),
        is_admin: z.boolean().optional(),
      })
      .safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }
    const hash = await bcrypt.hash(body.data.password, 10);
    try {
      const { rows } = await query(
        `INSERT INTO users (name, password_hash, email, note, is_admin)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING guid, name, email, display_name, note, status, is_admin`,
        [
          body.data.name,
          hash,
          body.data.email ?? null,
          body.data.note ?? null,
          body.data.is_admin ?? false,
        ],
      );
      return rows[0];
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('unique')) {
        return reply.code(400).send({ error: 'User already exists' });
      }
      throw e;
    }
  });

  app.post(
    '/api/users/:guid/disable',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const r = await query(
        'UPDATE users SET status = 0, updated_at = NOW() WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/users/:guid/enable',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const r = await query(
        'UPDATE users SET status = 1, updated_at = NOW() WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.delete(
    '/api/users/:guid',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      if (guid === request.user?.guid) {
        return reply.code(400).send({ error: 'Cannot delete yourself' });
      }
      const r = await query(
        'DELETE FROM users WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/deploy-tokens',
    { preHandler: requireAdmin },
    async (request) => {
      const body = z
        .object({
          label: z.string().optional(),
          expires_days: z.number().int().positive().optional(),
        })
        .safeParse(request.body || {});
      const token = randomBytes(24).toString('hex');
      const expires =
        body.success && body.data.expires_days
          ? new Date(
              Date.now() + body.data.expires_days * 86400000,
            ).toISOString()
          : null;
      await query(
        `INSERT INTO deploy_tokens (token, label, created_by, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [
          token,
          body.success ? body.data.label ?? null : null,
          request.user!.guid,
          expires,
        ],
      );
      return { token, expires_at: expires };
    },
  );

  app.get(
    '/api/deploy-tokens',
    { preHandler: requireAdmin },
    async () => {
      const { rows } = await query(
        `SELECT token, label, created_at, expires_at, revoked
         FROM deploy_tokens ORDER BY created_at DESC LIMIT 50`,
      );
      return { data: rows };
    },
  );
}
