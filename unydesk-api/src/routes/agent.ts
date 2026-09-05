import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { redis } from '../db/redis.js';

export async function agentRoutes(app: FastifyInstance) {
  app.post('/api/sysinfo_ver', async () => {
    return '1';
  });

  app.post('/api/sysinfo', async (request, reply) => {
    const body = (request.body || {}) as Record<string, unknown>;
    const id = String(body.id || '');
    if (!id) {
      return reply.code(400).send('INVALID_INPUT');
    }

    const uuid = body.uuid != null ? String(body.uuid) : null;
    const hostname = body.hostname != null ? String(body.hostname) : null;
    const username = body.username != null ? String(body.username) : null;
    const os = body.os != null ? String(body.os) : null;
    const cpu = body.cpu != null ? String(body.cpu) : null;
    const memory = body.memory != null ? String(body.memory) : null;
    const version = body.version != null ? String(body.version) : null;
    const note =
      body['preset-note'] != null ? String(body['preset-note']) : null;
    const deviceGroup =
      body['preset-device-group-name'] != null
        ? String(body['preset-device-group-name'])
        : null;
    const userName =
      body['preset-user-name'] != null
        ? String(body['preset-user-name'])
        : body['preset-username'] != null
          ? String(body['preset-username'])
          : null;

    const existing = await query<{ id: string }>(
      'SELECT id FROM devices WHERE id = $1',
      [id],
    );
    if (!existing.rows[0]) {
      // Auto-register on first sysinfo (dev-friendly); deploy still preferred
      await query(
        `INSERT INTO devices (
           id, uuid, hostname, device_name, username, os, cpu, memory, version,
           note, user_name, device_group_name, last_online, sysinfo, updated_at
         ) VALUES (
           $1,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12::jsonb,NOW()
         )`,
        [
          id,
          uuid,
          hostname,
          username,
          os,
          cpu,
          memory,
          version,
          note,
          userName,
          deviceGroup,
          JSON.stringify(body),
        ],
      );
      return 'SYSINFO_UPDATED';
    }

    await query(
      `UPDATE devices SET
         uuid = COALESCE($2, uuid),
         hostname = COALESCE($3, hostname),
         device_name = COALESCE($3, device_name),
         username = COALESCE($4, username),
         os = COALESCE($5, os),
         cpu = COALESCE($6, cpu),
         memory = COALESCE($7, memory),
         version = COALESCE($8, version),
         note = COALESCE($9, note),
         user_name = COALESCE($10, user_name),
         device_group_name = COALESCE($11, device_group_name),
         last_online = NOW(),
         sysinfo = $12::jsonb,
         updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        uuid,
        hostname,
        username,
        os,
        cpu,
        memory,
        version,
        note,
        userName,
        deviceGroup,
        JSON.stringify(body),
      ],
    );
    return 'SYSINFO_UPDATED';
  });

  app.post('/api/heartbeat', async (request) => {
    const body = z
      .object({
        id: z.string(),
        uuid: z.string().optional(),
        ver: z.union([z.string(), z.number()]).optional(),
        conns: z.array(z.number()).optional(),
        modified_at: z.number().optional(),
      })
      .passthrough()
      .safeParse(request.body);

    if (!body.success) {
      return {};
    }

    const { id, uuid, conns, modified_at } = body.data;

    await query(
      `UPDATE devices SET
         last_online = NOW(),
         uuid = COALESCE($2, uuid),
         conns = COALESCE($3::jsonb, conns),
         updated_at = NOW()
       WHERE id = $1`,
      [id, uuid ?? null, conns ? JSON.stringify(conns) : null],
    );

    try {
      await redis.set(`device:online:${id}`, '1', 'EX', 60);
    } catch {
      /* optional */
    }

    const disconnect = await query<{ conn_id: number }>(
      `DELETE FROM disconnect_queue WHERE device_id = $1
       RETURNING conn_id`,
      [id],
    );

    const device = await query<{ strategy_modified_at: string }>(
      'SELECT strategy_modified_at FROM devices WHERE id = $1',
      [id],
    );
    const rspModified = Number(device.rows[0]?.strategy_modified_at || 0);
    const clientModified = modified_at ?? 0;

    const rsp: Record<string, unknown> = {};
    if (disconnect.rows.length) {
      rsp.disconnect = disconnect.rows.map((r) => r.conn_id);
    }
    if (rspModified !== clientModified) {
      rsp.modified_at = rspModified;
      rsp.strategy = { config_options: {}, extra: {} };
    }
    return rsp;
  });
}
