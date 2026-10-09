# Minimalist Bento main-site redesign

This is an **Express + EJS** implementation of the approved minimalist-bento homepage design. It is not a standalone static HTML mockup.

## Which ZIP to use

- **bento-main-site-overlay.zip**: recommended for the current/later version of your repository. It contains just the main-site files that changed and one new optional footer-link configuration file.
- **bento-full-july-snapshot.zip**: an updated copy of the July 2026 `oracleSite-main.zip` provided in this chat, so you can run and experiment with the design without merging files. This snapshot **does not contain your newer NZT implementation**.

**Important:** Before copying `routes/main.js` from the overlay into a newer checkout, diff it against your current file. The uploaded source predates your August NZT work. Preserve any routes added since then. The intended main-route changes are mainly passing `projects` and `posts` to `main/home`, checking whether the resume PDF is present, and setting optional public footer links.

## Files

- `views/layouts/main-layout.ejs`: page shell, fonts, metadata, header and footer.
- `views/partials/main/header.ejs`: numbered navigation and mobile menu.
- `views/partials/main/footer.ejs`: footer navigation and optional configured social links.
- `views/main/*.ejs`: homepage, About, Projects, project details, Blog, Resume, and error pages.
- `public/main/css/style.css`: the full responsive visual system.
- `public/main/js/main.js`: small vanilla JS menu handler.
- `public/main/images/*.webp`: local illustration crops from the selected concept mockup (not linked to an outside image service).
- `routes/main.js`: existing main-site routes with the homepage data sources.
- `data/site-links.js`: optional GitHub, LinkedIn, and email footer links; blank links are hidden.
- `scripts/smoke-main.js`: optional route smoke checks.

No changes are made to `app.js`, Labs code, the NZT router, Nginx configuration, MongoDB, sessions, pm2, or existing `data/projects.js` / `data/posts.js` content.

## Run locally

From the repository root:

```bash
npm ci
npm run dev
```

Then visit `http://localhost:3000`. If you have configured `PORT` in `.env`, use that port instead.

To test the main-site routes (while the server is running):

```bash
node scripts/smoke-main.js
```

For a non-default port, set `SITE_URL=http://127.0.0.1:YOUR_PORT`.

## Wiring the existing NZT app

The featured bento card links to **`/nzt`**, matching the route discussed previously. The July snapshot supplied here does **not** have that route, so clicking it in the standalone July ZIP will show a 404. On your current checkout, retain your newer `/nzt` router and view files. Do not overwrite `app.js` with the July version when merging.

## Content and personalization

- Writing and Projects remain driven by `data/posts.js` and `data/projects.js`.
- Edit `data/site-links.js` to add real GitHub, LinkedIn and email links. The old repository contained placeholder contact URLs, so this redesign deliberately doesn't link to nonexistent accounts.
- The original Resume data is placeholder content. Replace it with real information in `views/main/resume.ejs`.
- Place `resume.pdf` in `public/main/` to show a functional download on `/resume`; the URL is `/assets/main/resume.pdf`.
- The hero, NZT, Labs, About and resume artwork are local crops of the previously approved visual concept. You can replace the WebP images with your own photographs/art later without touching any routes.

## Colour experiments

All major colours live at the top of `public/main/css/style.css`:

```css
:root {
  --bg: #f2f0eb;
  --card: #f8f7f3;
  --ink: #18191a;
  --muted: #61615d;
  --rule: #bdbcb5;
  --accent: #bf7e25;
  --accent-dark: #91580f;
}
```

## Validation performed here

- Syntax checks of changed JavaScript files.
- Offline template-compilation/render checks of eight page cases with their current data.
- Parsed generated HTML and checked referenced local images.
- Parsed CSS for syntax errors.

**Not verified in this environment:** npm install, full Express startup, and browser screenshot/interaction comparison. The environment could not reach the npm registry and headless Chromium did not produce a screenshot. Run the included smoke check after installing dependencies locally and inspect the pages in your browser before deploying.
