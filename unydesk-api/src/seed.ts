import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { query } from './db/pool.js';

/** Ensure default admin exists with password from env. */
export async function ensureAdmin() {
  const { rows } = await query<{ guid: string; password_hash: string }>(
    'SELECT guid, password_hash FROM users WHERE name = $1',
    [config.adminUser],
  );
  const hash = await bcrypt.hash(config.adminPassword, 10);
  if (!rows[0]) {
    await query(
      `INSERT INTO users (name, email, password_hash, display_name, is_admin, status)
       VALUES ($1, $2, $3, $4, TRUE, 1)`,
      [
        config.adminUser,
        'admin@unysystems.local',
        hash,
        'UnyDesk Admin',
      ],
    );
    console.log(`[seed] created admin user "${config.adminUser}"`);
    return;
  }
  // Always sync password from env in MVP so docs stay true
  await query(
    'UPDATE users SET password_hash = $2, status = 1, is_admin = TRUE WHERE name = $1',
    [config.adminUser, hash],
  );
}

async function main() {
  await ensureAdmin();
  console.log('Seed complete');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
