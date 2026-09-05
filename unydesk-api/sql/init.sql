-- UnyDesk management DB (proprietary)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  guid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  note TEXT,
  status INT NOT NULL DEFAULT 1, -- 0 disabled, 1 normal, -1 unverified
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  guid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id TEXT NOT NULL UNIQUE,
  uuid TEXT,
  pk TEXT,
  device_name TEXT,
  hostname TEXT,
  username TEXT,
  os TEXT,
  cpu TEXT,
  memory TEXT,
  version TEXT,
  note TEXT,
  user_name TEXT,
  group_name TEXT,
  device_group_name TEXT,
  disabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_online TIMESTAMPTZ,
  sysinfo JSONB,
  sysinfo_hash TEXT,
  conns JSONB DEFAULT '[]'::jsonb,
  strategy_modified_at BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_last_online ON devices(last_online DESC);
CREATE INDEX IF NOT EXISTS idx_devices_device_name ON devices(device_name);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_guid UUID NOT NULL REFERENCES users(guid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  device_info JSONB
);

CREATE TABLE IF NOT EXISTS deploy_tokens (
  token TEXT PRIMARY KEY,
  label TEXT,
  created_by UUID REFERENCES users(guid) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS disconnect_queue (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  conn_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  actor TEXT,
  device_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default admin: admin / UnyDesk!admin  (bcrypt cost 10)
-- Hash generated at API bootstrap if missing; placeholder row optional.
INSERT INTO users (name, email, password_hash, display_name, is_admin, status)
VALUES (
  'admin',
  'admin@unysystems.local',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'UnyDesk Admin',
  TRUE,
  1
) ON CONFLICT (name) DO NOTHING;
