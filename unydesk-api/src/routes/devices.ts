import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { requireAuth, requireDeployOrUser } from '../middleware/auth.js';

function likeParam(v: string | undefined) {
  if (!v || v === '-') return null;
  return v.includes('%') ? v : `%${v}%`;
}

function mapDevice(row: Record<string, unknown>) {
  const last = row.last_online ? new Date(String(row.last_online)) : null;
  const online =
    last != null &&
    Date.now() - last.getTime() < config.onlineThresholdSec * 1000;
  return {
    guid: row.guid,
    id: row.id,
    uuid: row.uuid,
    device_name: row.device_name || row.hostname || row.id,
    hostname: row.hostname,
    user_name: row.user_name || row.username,
    username: row.username,
    os: row.os,
    cpu: row.cpu,
    memory: row.memory,
    version: row.version,
    note: row.note,
    group_name: row.group_name,
    device_group_name: row.device_group_name,
    disabled: row.disabled,
    last_online: row.last_online,
    online,
    conns: row.conns || [],
  };
}

export async function deviceRoutes(app: FastifyInstance) {
  app.get('/api/devices', { preHandler: requireAuth }, async (request) => {
    const q = request.query as Record<string, string | undefined>;
    const pageSize = Math.min(Number(q.pageSize || 30), 200);
    const current = Math.max(Number(q.current || 1), 1);
    const offset = (current - 1) * pageSize;

    const filters: string[] = [];
    const params: unknown[] = [];
    const add = (sql: string, val: string | null) => {
      if (val == null) return;
      params.push(val);
      filters.push(`${sql} $${params.length}`);
    };

    add('id ILIKE', likeParam(q.id));
    if (likeParam(q.device_name)) {
      params.push(likeParam(q.device_name));
      filters.push(
        `(device_name ILIKE $${params.length} OR hostname ILIKE $${params.length})`,
      );
    }
    add('user_name ILIKE', likeParam(q.user_name));
    add('group_name ILIKE', likeParam(q.group_name));
    add('device_group_name ILIKE', likeParam(q.device_group_name));

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const total = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM devices ${where}`,
      params,
    );
    params.push(pageSize, offset);
    const { rows } = await query(
      `SELECT * FROM devices ${where}
       ORDER BY last_online DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      data: rows.map((r) => mapDevice(r as Record<string, unknown>)),
      total: Number(total.rows[0]?.count || 0),
    };
  });

  app.post(
    '/api/devices/:guid/disable',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const r = await query(
        'UPDATE devices SET disabled = TRUE, updated_at = NOW() WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/devices/:guid/enable',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const r = await query(
        'UPDATE devices SET disabled = FALSE, updated_at = NOW() WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/devices/:guid/assign',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const body = z
        .object({
          user_name: z.string().optional(),
          group_name: z.string().optional(),
          device_group_name: z.string().optional(),
          note: z.string().optional(),
        })
        .safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Invalid input' });
      }
      const b = body.data;
      const r = await query(
        `UPDATE devices SET
           user_name = COALESCE($2, user_name),
           group_name = COALESCE($3, group_name),
           device_group_name = COALESCE($4, device_group_name),
           note = COALESCE($5, note),
           updated_at = NOW()
         WHERE guid = $1 RETURNING guid`,
        [guid, b.user_name ?? null, b.group_name ?? null, b.device_group_name ?? null, b.note ?? null],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.delete(
    '/api/devices/:guid',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const r = await query(
        'DELETE FROM devices WHERE guid = $1 RETURNING guid',
        [guid],
      );
      if (!r.rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/devices/deploy',
    { preHandler: requireDeployOrUser },
    async (request) => {
      const body = z
        .object({
          id: z.string().min(1),
          uuid: z.string().optional(),
          pk: z.string().optional(),
        })
        .safeParse(request.body);
      if (!body.success) {
        return { result: 'INVALID_INPUT' };
      }
      const { id, uuid, pk } = body.data;
      const taken = await query<{ uuid: string | null }>(
        'SELECT uuid FROM devices WHERE id = $1',
        [id],
      );
      if (taken.rows[0] && taken.rows[0].uuid && uuid && taken.rows[0].uuid !== uuid) {
        return { result: 'ID_TAKEN' };
      }
      await query(
        `INSERT INTO devices (id, uuid, pk, last_online, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           uuid = COALESCE(EXCLUDED.uuid, devices.uuid),
           pk = COALESCE(EXCLUDED.pk, devices.pk),
           last_online = NOW(),
           updated_at = NOW()`,
        [id, uuid ?? null, pk ?? null],
      );
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/devices/cli',
    { preHandler: requireDeployOrUser },
    async (request) => {
      // Same shape as deploy for MVP assign-from-cli
      const body = (request.body || {}) as Record<string, unknown>;
      const id = String(body.id || '');
      if (!id) return { result: 'INVALID_INPUT' };
      await query(
        `INSERT INTO devices (id, uuid, pk, note, last_online, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           note = COALESCE($4, devices.note),
           last_online = NOW(),
           updated_at = NOW()`,
        [
          id,
          body.uuid != null ? String(body.uuid) : null,
          body.pk != null ? String(body.pk) : null,
          body.note != null ? String(body.note) : null,
        ],
      );
      return { result: 'OK' };
    },
  );

  app.post(
    '/api/devices/:guid/disconnect',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { guid } = request.params as { guid: string };
      const body = z
        .object({ conn_ids: z.array(z.number()).min(1) })
        .safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Invalid input' });
      }
      const device = await query<{ id: string }>(
        'SELECT id FROM devices WHERE guid = $1',
        [guid],
      );
      if (!device.rows[0]) return reply.code(404).send({ error: 'Not found' });
      for (const connId of body.data.conn_ids) {
        await query(
          'INSERT INTO disconnect_queue (device_id, conn_id) VALUES ($1, $2)',
          [device.rows[0].id, connId],
        );
      }
      return { result: 'OK' };
    },
  );
}
