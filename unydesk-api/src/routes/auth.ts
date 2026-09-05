import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

function userPayload(row: {
  name: string;
  display_name: string | null;
  email: string | null;
  note: string | null;
  status: number;
  is_admin: boolean;
}) {
  return {
    name: row.name,
    display_name: row.display_name,
    email: row.email,
    note: row.note,
    status: row.status,
    is_admin: row.is_admin,
    info: {
      email_verification: false,
      email_alarm_notification: false,
      login_device_whitelist: [],
      other: {},
    },
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.get('/api/login-options', async () => {
    // Empty list = password login only (no OIDC in MVP)
    return [];
  });

  app.post('/api/login', async (request, reply) => {
    const body = z
      .object({
        username: z.string().min(1),
        password: z.string().min(1),
        id: z.string().optional(),
        uuid: z.string().optional(),
        autoLogin: z.boolean().optional(),
        type: z.string().optional(),
        deviceInfo: z.record(z.unknown()).optional(),
      })
      .safeParse(request.body);

    if (!body.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }

    const { rows } = await query<{
      guid: string;
      name: string;
      password_hash: string;
      display_name: string | null;
      email: string | null;
      note: string | null;
      status: number;
      is_admin: boolean;
    }>('SELECT * FROM users WHERE name = $1', [body.data.username]);

    const user = rows[0];
    if (!user || user.status === 0) {
      return reply.code(401).send({ error: 'Wrong username or password' });
    }
    const ok = await bcrypt.compare(body.data.password, user.password_hash);
    if (!ok) {
      return reply.code(401).send({ error: 'Wrong username or password' });
    }

    const access_token = jwt.sign(
      { sub: user.guid, name: user.name, is_admin: user.is_admin },
      config.jwtSecret,
      { expiresIn: '7d' },
    );

    const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await query(
      `INSERT INTO sessions (token, user_guid, expires_at, device_info)
       VALUES ($1, $2, $3, $4)`,
      [
        access_token,
        user.guid,
        expires.toISOString(),
        JSON.stringify(body.data.deviceInfo || {}),
      ],
    );

    return {
      access_token,
      type: 'access_token',
      tfa_type: '',
      secret: '',
      user: userPayload(user),
    };
  });

  app.post('/api/logout', { preHandler: requireAuth }, async (request) => {
    if (request.bearerToken) {
      await query('DELETE FROM sessions WHERE token = $1', [
        request.bearerToken,
      ]);
    }
    return { result: 'OK' };
  });

  app.get('/api/currentUser', { preHandler: requireAuth }, async (request) => {
    const { rows } = await query<{
      name: string;
      display_name: string | null;
      email: string | null;
      note: string | null;
      status: number;
      is_admin: boolean;
    }>(
      'SELECT name, display_name, email, note, status, is_admin FROM users WHERE guid = $1',
      [request.user!.guid],
    );
    return userPayload(rows[0]);
  });
}
