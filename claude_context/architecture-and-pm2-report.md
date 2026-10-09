# Personal Site — Architecture & Operations Report

## Summary

The site at `zoltanbiro.ca` runs as a single Node.js/Express application, serving two distinct sections — a static main/portfolio site and a "Labs" sandbox — from one codebase, one process, and one Nginx-fronted HTTPS endpoint. The process is kept alive by pm2. This report covers how the pieces fit together, why the structure was chosen, and how to operate it (starting, restarting, and diagnosing pm2 in particular).

## High-Level Architecture

```
Browser
   │  HTTPS request to zoltanbiro.ca
   ▼
Nginx (reverse proxy + TLS termination, ports 80/443)
   │  forwards plain HTTP internally
   ▼
Express app (port 8080, 127.0.0.1 only)
   │  managed and kept alive by pm2
   ├── Main site routes  (/, /projects, /resume, /contact)
   └── Labs routes       (/labs, /labs/<app>)
                              │
                              ▼
                         MongoDB (Labs data + sessions only)
```

Nginx and TLS were covered in the earlier HTTPS setup report and haven't changed. This report picks up at the Express application layer — what's running on port 8080 and how pm2 keeps it there.

## Why Two Sections, One App

The main site and Labs live in the same Express process rather than as two separate deployments, because:

- They share one domain, one Nginx config, one TLS cert, and one pm2 process — less to operate.
- The main site needs no database; Labs does. Keeping them in one app with MongoDB wired up as optional (see below) means the main site never goes down because of a Labs/Mongo problem.
- A shared process is enough for the traffic this site expects. If Labs ever needs to scale independently, it can be split out later — nothing here prevents that.

Within the app, the two sections are kept structurally separate on purpose:

| Concern | Main site | Labs |
|---|---|---|
| Routes | `routes/main.js` | `routes/labs.js` (+ per-app sub-routers) |
| Layout | `views/layouts/main-layout.ejs` | `views/layouts/labs-layout.ejs` |
| Partials | `views/partials/main/` | `views/partials/labs/` |
| Static assets | `public/main/` → `/assets/main/...` | `public/labs/` → `/assets/labs/...` |
| Database | none | MongoDB, one collection grouping per app |

Nothing about this separation is enforced by a framework boundary — it's a folder and naming convention. That's intentional: it keeps the two sections visually and logically distinct without the overhead of running them as separate services.

## Request Flow Through the App

1. **`app.js`** is the single entry point. On startup it:
   - Configures the EJS view engine and `express-ejs-layouts`
   - Sets `trust proxy` to 1, so Express correctly reads the `X-Forwarded-*` headers Nginx sets (this matters for secure cookies — more below)
   - Mounts two static file handlers, one per section
   - Sets up `express-session`, backed by MongoDB via `connect-mongo` when `MONGO_URI` is set
   - Mounts `routes/main.js` at `/` and `routes/labs.js` at `/labs`
   - Starts listening on `PORT` (8080 in production)
   - Calls `connectDB()` without blocking startup on it

2. **A request for the main site** (e.g. `/projects`) hits `routes/main.js`, which renders an EJS view with `layout: 'layouts/main-layout'`. That layout pulls in `views/partials/main/header.ejs` and `footer.ejs`, and the page references `/assets/main/css/style.css`. No database is touched.

3. **A request for Labs** (e.g. `/labs`) hits `routes/labs.js`, renders with `layout: 'layouts/labs-layout'`, pulls in the Labs partials, and references `/assets/labs/css/style.css`. Individual Labs apps, once built, are mounted as sub-routers under `/labs/<app-slug>` and can read/write their own MongoDB collections and use the shared session middleware for login.

## Why It Works Behind Nginx (the `trust proxy` fix)

Nginx terminates TLS and forwards requests to Express as plain HTTP, per the earlier setup. That means Express, by default, has no way of knowing the original request was HTTPS — it only sees an internal HTTP connection from Nginx. This matters because the session cookie is configured with `secure: true` in production, which tells the browser to only send that cookie back over HTTPS.

Without `app.set('trust proxy', 1)`, Express doesn't trust the `X-Forwarded-Proto` header Nginx sends, so it can't confirm the original request was secure — and `secure` cookies can silently fail to be set at all, breaking sessions (and therefore any Labs login) even though the site otherwise looks like it's working. Adding `trust proxy` tells Express to trust Nginx's forwarded headers, so `req.secure` and the cookie logic behave correctly.

This is a common gotcha in exactly this kind of reverse-proxy setup, and it's the one architectural fix made specifically for the production environment (as opposed to local development, where there's no proxy in front and no HTTPS to worry about).

## Configuration: `.env`

Runtime configuration is kept out of code and loaded via `dotenv`:

| Variable | Purpose |
|---|---|
| `PORT` | Must be `8080` in production to match what Nginx proxies to |
| `NODE_ENV` | `production` — enables secure cookies, among other things |
| `SESSION_SECRET` | Signs the session cookie; should be a long random string |
| `MONGO_URI` | Connection string for Labs data + session store |

If `MONGO_URI` is unset, `config/db.js` logs a warning and skips connecting — the app falls back to an in-memory session store rather than crashing. This is deliberate: the main site has no business being down because Mongo isn't configured yet.

## Process Management: pm2

### Why pm2

Running `node app.js` directly works until the terminal closes, the process crashes, or the VM reboots — at which point the site goes down until someone notices and manually restarts it. pm2 solves this by:

- Running the app as a background daemon, detached from any terminal session
- Automatically restarting it if it crashes
- Persisting the process list across VM reboots (once configured — see below)
- Providing centralized logs and basic monitoring

### Configuration: `ecosystem.config.js`

```js
module.exports = {
  apps: [
    {
      name: 'personal-site',
      script: './app.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Key choices, given the hosting constraint (Oracle Free Tier, 1 OCPU / 1GB RAM, shared with MongoDB on the same box):

- **`instances: 1` / `exec_mode: 'fork'`** — a single process rather than pm2's cluster mode. Cluster mode spins up one process per CPU core, which would compete for the box's single core and its already-tight 1GB of RAM for no real benefit at this traffic level.
- **`max_memory_restart: '400M'`** — a guardrail. If the Express process balloons past 400MB (a leak, a runaway request, etc.), pm2 kills and restarts it automatically rather than letting it consume enough memory to starve MongoDB or the OS.
- **`watch: false`** — pm2 won't restart on file changes in production (that's what `nodemon`/`npm run dev` is for locally). In production, restarts should be deliberate (`pm2 restart`), not automatic on every file touch.

### Operating Commands

| Command | What it does | When to use it |
|---|---|---|
| `pm2 start ecosystem.config.js` | Registers and starts the app under pm2 for the **first time** | Initial setup only |
| `pm2 restart personal-site` | Restarts an **already-registered** process | After every code deploy |
| `pm2 stop personal-site` | Stops the process but keeps it registered | Temporary maintenance |
| `pm2 delete personal-site` | Unregisters the process entirely | Recovering from a broken registration |
| `pm2 status` | Lists all pm2-managed processes and their state | Quick health check |
| `pm2 logs personal-site` | Tails stdout/stderr for the app | Debugging |
| `pm2 monit` | Live CPU/memory view | Watching resource usage on the 1GB box |
| `pm2 save` | Snapshots the current process list | After any change to what's running |
| `pm2 startup` | Prints (and can install) a systemd service so pm2 itself restarts on boot | Once, during initial setup |

The distinction between `start` and `restart` was the actual issue encountered during setup: `restart` only works on a process pm2 already knows about by that name. The correct one-time sequence was `pm2 start ecosystem.config.js`, and every deploy after that uses `pm2 restart personal-site`.

**Both `pm2 save` and `pm2 startup` are required for reboot survival** — `pm2 startup` installs the systemd service that brings pm2 itself back after a reboot, and `pm2 save` is what tells that restored pm2 instance which processes to bring back up. Doing only one without the other means the site won't recover automatically after a VM restart.

## Verifying the Full Path

```bash
curl -I http://127.0.0.1:8080     # Express responding directly — bypasses Nginx entirely
curl -I https://zoltanbiro.ca      # Full path through Nginx + TLS
curl -I https://www.zoltanbiro.ca  # Same, for the www subdomain
```

All three should return `200`. Per the earlier HTTPS setup report, a `502` from the last two almost always means Nginx and TLS are fine but Express itself isn't running or isn't listening on 8080 — `pm2 status` and `pm2 logs personal-site` are the first things to check, before touching the Nginx config at all.

## Current State

- Express app runs on `127.0.0.1:8080`, managed by pm2 under the process name `personal-site`
- pm2 is configured to survive both process crashes and VM reboots (`ecosystem.config.js` + `pm2 save` + `pm2 startup`)
- Nginx terminates TLS and proxies to Express; `trust proxy` in `app.js` ensures secure session cookies work correctly through that proxy
- Main site is fully static and has no dependency on MongoDB being available
- Labs section is wired for MongoDB-backed data and session-based auth, ready for individual apps to be added as sub-routers
