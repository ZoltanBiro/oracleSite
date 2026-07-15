# Personal Site

Two sections, one Express app:

- **Main site** (`/`) — static portfolio. No database.
- **Labs** (`/labs`) — sandbox of small experiments. Uses MongoDB, gets its
  own layout/CSS so it visually reads as distinct from the main site.

## Structure

```
app.js                  Entry point — wires up view engine, static assets,
                         sessions, DB connection, routes, error handling
config/
  db.js                 Mongo connection (Labs-only; main site ignores this)
routes/
  main.js               Main site route stubs (/, /projects, /resume, /contact)
  labs.js               Labs landing route + where you'll mount individual
                         labs apps as sub-routers
models/                 One subfolder per labs app (see models/README.md)
views/
  layouts/
    main-layout.ejs      Shared shell for main site pages
    labs-layout.ejs       Shared shell for labs pages (distinct look)
  partials/
    main/                Header/footer for main site
    labs/                Header/footer for labs
  main/                  Main site page templates
  labs/                  Labs page templates
public/
  main/{css,js}          Assets served at /assets/main/...
  labs/{css,js}          Assets served at /assets/labs/...
ecosystem.config.js      pm2 process config
.env.example             Copy to .env and fill in
```

## Local setup

```bash
npm install
cp .env.example .env    # then edit values, especially SESSION_SECRET
npm run dev              # nodemon, auto-restarts on changes
```


MongoDB isn't required to run the main site. If `MONGO_URI` is unset, the
app logs a warning and falls back to an in-memory session store — fine for
early development, not for production or for any labs app that touches the
DB.

## Deploying with pm2

```bash
npm install --production
pm2 start ecosystem.config.js
pm2 save
pm2 startup             # follow the printed instructions to persist across reboots
```

`ecosystem.config.js` caps memory at 400MB per the Oracle Free Tier 1GB
instance constraint — adjust once you move to a bigger box.

## Adding a new Labs app

1. Add a route file: `routes/labs/<app-slug>.js`, mount it in `routes/labs.js`.
2. Add views under `views/labs/<app-slug>/`.
3. If it needs its own data, add `models/<app-slug>/` (see `models/README.md`
   for the collection-naming convention).
4. If it needs auth, use the session middleware already set up in `app.js`
   (`express-session` + `connect-mongo`) — check `req.session.user` and hash
   passwords with `bcrypt` before storing them.
5. Add an entry to the `apps` array in `routes/labs.js` so it shows up on
   the Labs landing page.
