/**
 * Alfred admin CLI — the jobs that need a privileged key and otherwise mean
 * opening the Supabase SQL editor by hand (BUG-4).
 *
 * Reads credentials from .env.admin.local, which is gitignored. The key is
 * never passed on the command line, so it stays out of shell history.
 *
 *   node scripts/admin.mjs check                 verify the key works
 *   node scripts/admin.mjs users                 list accounts + onboarding state
 *   node scripts/admin.mjs find <email>          look up one account
 *   node scripts/admin.mjs delete <email>        delete an account (cascades)
 *   node scripts/admin.mjs orphans               app rows with no auth account
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  let raw;
  try {
    raw = readFileSync(join(root, '.env.admin.local'), 'utf8');
  } catch {
    fail('.env.admin.local not found. Copy .env.admin.example to .env.admin.local and fill it in.');
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) fail('SUPABASE_URL or SUPABASE_SECRET_KEY missing from .env.admin.local');
  if (env.SUPABASE_SECRET_KEY.includes('PASTE_YOURS_HERE') || env.SUPABASE_SECRET_KEY.includes('REPLACE_ME')) {
    fail('SUPABASE_SECRET_KEY is still the placeholder. Paste the real sb_secret_... key into .env.admin.local.');
  }
  return env;
}

function fail(msg) {
  console.error('\n  ' + msg + '\n');
  process.exit(1);
}

const { SUPABASE_URL: URL_, SUPABASE_SECRET_KEY: KEY } = loadEnv();
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function api(path, init = {}) {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: H });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) fail(`HTTP ${res.status} on ${path}\n  ${JSON.stringify(body)}`);
  return body;
}

const authUsers = () => api('/auth/v1/admin/users?per_page=200').then((d) => d.users ?? []);
const appUsers = () => api('/rest/v1/users?select=id,email,display_name,onboarding_complete,created_at');

async function rowsFor(id) {
  const [tracks, activity] = await Promise.all([
    api(`/rest/v1/tracks?select=id&user_id=eq.${id}`),
    api(`/rest/v1/activity_log?select=xp_awarded&user_id=eq.${id}`),
  ]);
  return { tracks: tracks.length, xp: activity.reduce((n, a) => n + (a.xp_awarded ?? 0), 0) };
}

const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
  case 'check': {
    const users = await authUsers();
    console.log(`\n  Key works. ${users.length} account(s) on ${URL_}\n`);
    break;
  }

  case 'users': {
    const [auth, app] = await Promise.all([authUsers(), appUsers()]);
    const byId = Object.fromEntries(app.map((u) => [u.id, u]));
    console.log();
    if (!auth.length) console.log('  (no accounts)');
    for (const u of auth) {
      const a = byId[u.id];
      const state = !a ? 'no app row' : a.onboarding_complete ? 'onboarded' : 'mid-onboarding';
      const extra = a ? await rowsFor(u.id) : { tracks: 0, xp: 0 };
      console.log(`  ${u.email.padEnd(40)} ${state.padEnd(16)} ${extra.tracks} track(s)  ${extra.xp} XP`);
    }
    console.log();
    break;
  }

  case 'find': {
    if (!arg) fail('Usage: node scripts/admin.mjs find <email>');
    const auth = (await authUsers()).filter((u) => u.email === arg);
    const app = await api(`/rest/v1/users?select=*&email=eq.${encodeURIComponent(arg)}`);
    console.log(`\n  auth rows: ${auth.length}   app rows: ${app.length}`);
    if (auth[0]) console.log(`  id: ${auth[0].id}\n  confirmed: ${Boolean(auth[0].email_confirmed_at)}`);
    if (app[0]) {
      const r = await rowsFor(app[0].id);
      console.log(`  name: ${app[0].display_name || '(none)'}\n  onboarded: ${app[0].onboarding_complete}\n  ${r.tracks} track(s), ${r.xp} XP`);
    }
    if (!auth.length && !app.length) console.log('  not found — address is free');
    console.log();
    break;
  }

  case 'delete': {
    if (!arg) fail('Usage: node scripts/admin.mjs delete <email>');
    const user = (await authUsers()).find((u) => u.email === arg);
    if (!user) fail(`No auth account for ${arg}`);
    const before = await rowsFor(user.id);
    await api(`/auth/v1/admin/users/${user.id}`, { method: 'DELETE' });
    const left = await api(`/rest/v1/users?select=id&email=eq.${encodeURIComponent(arg)}`);
    console.log(`\n  Deleted ${arg} (${before.tracks} track(s), ${before.xp} XP)`);
    console.log(`  app rows remaining: ${left.length} ${left.length === 0 ? '(cascade OK)' : '(ORPHAN — check the FK)'}\n`);
    break;
  }

  case 'orphans': {
    const [auth, app] = await Promise.all([authUsers(), appUsers()]);
    const ids = new Set(auth.map((u) => u.id));
    const orphans = app.filter((u) => !ids.has(u.id));
    console.log(`\n  ${orphans.length} orphan(s)`);
    for (const o of orphans) console.log(`  ${o.email}  ${o.id}`);
    console.log();
    break;
  }

  default:
    console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0].split('/**')[1].replace(/^ \* ?/gm, '  '));
}
