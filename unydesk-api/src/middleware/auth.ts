import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/pool.js';

export type AuthUser = {
  guid: string;
  name: string;
  is_admin: boolean;
  status: number;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    bearerToken?: string;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // Deploy tokens are opaque (not JWT) — allowed on deploy routes only via requireDeployOrUser
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      name: string;
      is_admin: boolean;
    };
    const { rows } = await query<{
      guid: string;
      name: string;
      is_admin: boolean;
      status: number;
    }>('SELECT guid, name, is_admin, status FROM users WHERE guid = $1', [
      payload.sub,
    ]);
    if (!rows[0] || rows[0].status === 0) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    request.user = rows[0];
    request.bearerToken = token;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (!request.user?.is_admin) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

export async function requireDeployOrUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const deploy = await query<{ token: string }>(
    `SELECT token FROM deploy_tokens
     WHERE token = $1 AND revoked = FALSE
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [token],
  );
  if (deploy.rows[0]) {
    request.bearerToken = token;
    return;
  }
  return requireAuth(request, reply);
}
