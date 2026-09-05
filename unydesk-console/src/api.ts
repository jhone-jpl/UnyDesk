const API_BASE = import.meta.env.VITE_API_BASE || '';

export type Device = {
  guid: string;
  id: string;
  device_name?: string;
  hostname?: string;
  username?: string;
  user_name?: string;
  os?: string;
  version?: string;
  note?: string;
  disabled?: boolean;
  online?: boolean;
  last_online?: string;
  conns?: number[];
};

export type User = {
  guid: string;
  name: string;
  email?: string;
  display_name?: string;
  status: number;
  is_admin: boolean;
  note?: string;
};

async function request<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const err =
      typeof body === 'object' && body && 'error' in body
        ? String((body as { error: string }).error)
        : `HTTP ${res.status}`;
    throw new Error(err);
  }
  if (
    typeof body === 'object' &&
    body &&
    'error' in body &&
    (body as { error: string }).error
  ) {
    throw new Error(String((body as { error: string }).error));
  }
  return body as T;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, type: 'account' }),
    }),
  currentUser: (token: string) =>
    request<User>('/api/currentUser', { token }),
  logout: (token: string) =>
    request('/api/logout', { method: 'POST', token }),
  devices: (token: string) =>
    request<{ data: Device[]; total: number }>('/api/devices?pageSize=100', {
      token,
    }),
  enableDevice: (token: string, guid: string) =>
    request(`/api/devices/${guid}/enable`, { method: 'POST', token }),
  disableDevice: (token: string, guid: string) =>
    request(`/api/devices/${guid}/disable`, { method: 'POST', token }),
  deleteDevice: (token: string, guid: string) =>
    request(`/api/devices/${guid}`, { method: 'DELETE', token }),
  users: (token: string) =>
    request<{ data: User[]; total: number }>('/api/users?pageSize=100', {
      token,
    }),
  createUser: (
    token: string,
    data: { name: string; password: string; email?: string; is_admin?: boolean },
  ) =>
    request('/api/users', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  disableUser: (token: string, guid: string) =>
    request(`/api/users/${guid}/disable`, { method: 'POST', token }),
  enableUser: (token: string, guid: string) =>
    request(`/api/users/${guid}/enable`, { method: 'POST', token }),
  createDeployToken: (token: string, label?: string) =>
    request<{ token: string; expires_at: string | null }>('/api/deploy-tokens', {
      method: 'POST',
      token,
      body: JSON.stringify({ label, expires_days: 30 }),
    }),
  listDeployTokens: (token: string) =>
    request<{
      data: {
        token: string;
        label?: string;
        created_at: string;
        revoked: boolean;
      }[];
    }>('/api/deploy-tokens', { token }),
};
