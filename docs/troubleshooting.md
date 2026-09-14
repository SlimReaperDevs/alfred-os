# Alfred OS — troubleshooting

Symptoms seen or anticipated, with how to confirm and how to fix. Append as
testing turns up new ones.

Supabase project: `tmljizvoueikwrjtdjzs` (eu-west-1) ·
SQL editor: https://supabase.com/dashboard/project/tmljizvoueikwrjtdjzs/sql/new
Admin CLI: `node scripts/admin.mjs <check|users|find|delete|orphans>`

---

## 1. UNVERIFIED: users logged out mid-session, or a stale session accepted

**Status:** not observed. Logged because the code path it depends on has never
been watched doing the thing it exists to do.

**Background.** `proxy.ts` used to call `supabase.auth.getUser()` on every
request — a ~210ms round trip to Ireland — purely so it *could* refresh an
expiring access token. Commit `189ca8f` made that conditional: the token is
verified locally against the cached ES256 JWKS, and `getUser()` is only called
when the token is missing, unverifiable, or within `REFRESH_MARGIN_SECONDS`
(120s) of expiry.

**What was actually tested:** a comfortably valid token (skips the round trip,
proxy drops to ~6ms) and no token at all (falls through, redirect to /login
still works).

**What was NOT tested:** a real token crossing the 120-second margin and
refreshing. Access tokens live an hour, so that path only executes once per
hour per session and was never observed. This is the kind of logic that behaves
perfectly for 58 minutes and then does not.

**Symptoms to watch for**
- Being signed out unexpectedly after roughly an hour of use
- A session that appears valid but whose requests 401 against Supabase
- `resolveUserId` returning a `sub` for a token that should have expired

**Confirm.** In `web/proxy.ts`, temporarily raise `REFRESH_MARGIN_SECONDS` to
something larger than the token lifetime (e.g. `4000`). That forces every
request down the `getUser()` refresh path. If the symptom disappears, the
conditional skip is the cause.

**Fix options, in order of preference**
1. Widen the margin (300s rather than 120s) — cheap, keeps most of the win.
2. Revert `resolveUserId` to calling `getUser()` unconditionally. Costs ~210ms
   per navigation and returns to the pre-`189ca8f` behaviour, which was correct
   if slow.

Do NOT "fix" this by trusting a client-supplied header for the user id. That
converts a latency problem into an authentication bypass.

---

## 2. Invalid Refresh Token: Refresh Token Not Found (on sign-out)

Four `AuthApiError`s fired on every sign-out before `189ca8f`. They have not
reappeared since, across two full sign-in → navigate → sign-out cycles, but the
mechanism is unconfirmed and `getUser()` still runs in the fallback path. If
they return, that is where to look. Tracked on the defect board.

---

## 3. Onboarding completes but the Manor is empty

Fixed in `86979ec`. `tracks.id` and `activity_log.id` are `uuid` columns and
three call sites built ids by string concatenation, so Postgres rejected every
insert with `22P02` — silently, because the data layer discarded the error.

If it recurs, the signature is: `users` row saves fine, `tracks` and
`activity_log` stay empty, UI reports success. Check for `id:` values that are
not uuids, and use `generateId()` from `src/engine/id.ts`.

---

## 4. Deleted account blocks its email from being reused

Fixed in `86979ec` plus `supabase/migrations/20260914_users_auth_fk.sql`.
`public.users` had no FK to `auth.users`, so deleting the auth account orphaned
the app row, and `users.email` is `unique`.

`node scripts/admin.mjs orphans` reports app rows with no auth account — it
should always return 0. `delete <email>` reports whether the cascade fired.

---

## 5. Hostname returns NXDOMAIN

Free-tier Supabase projects pause after inactivity and their DNS record is
withdrawn, which looks exactly like deletion. The project is still listed in the
dashboard with status `INACTIVE`. Restore with the Management API (the CLI has
no restore command):

```bash
curl -X POST https://api.supabase.com/v1/projects/<ref>/restore \
  -H "Authorization: Bearer <sbp_token>" \
  -H "Content-Type: application/json" -d '{}'
```

Takes 2-4 minutes. Data, schema and the project ref all survive, so no env
changes are needed.

---

## 6. Environment separation — there is none

`vercel env ls` shows `NEXT_PUBLIC_SUPABASE_URL` and `_ANON_KEY` set identically
for Production, Preview **and** Development, all pointing at
`tmljizvoueikwrjtdjzs`.

Local dev, preview deploys and production therefore share one database. Any
account created while testing locally lands in production data, and any cleanup
deletes production rows. Fine while Alfred is single-user; not fine once anyone
else uses it.
