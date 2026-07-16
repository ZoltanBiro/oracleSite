# Project Detail Pages Report — zoltanbiro.ca

## Summary

Project cards on `/projects` are now clickable and lead to a dedicated
report page for each project at `/project/<slug>`. Rather than duplicating
project content between a list view and separate detail views, all project
data now lives in one shared file, and both the list page and the detail
page read from it. Adding a new project going forward means adding one
object to that file — no template changes required.

## Starting Point

Before this work:
- Project cards on `/projects` were static HTML, hand-written directly into
  `views/main/projects.ejs`
- Cards were not links — there was no way to click through to more detail
  on a given project
- There was no concept of a per-project page or URL

## What Was Built

### 1. A single source of truth: `data/projects.js`

All project content — the stuff that used to be hardcoded into the
`projects.ejs` template — was pulled out into a plain JS module that
exports an array of project objects:

```js
module.exports = [
  {
    slug: 'personal-site',
    title: 'Self-Hosted Personal Site',
    status: 'Live',
    summary: '...',
    tags: ['Node.js', 'Express', 'Nginx', 'MongoDB', 'pm2'],
    body: [ '...', '...', '...' ],   // one array entry per paragraph
    links: { repo: '...', demo: '...' },
  },
  // ...more projects
];
```

Each field has a specific job:

| Field | Used for |
|---|---|
| `slug` | The URL segment — `/project/<slug>` |
| `title`, `status`, `summary` | Shown on both the list card and the detail page header |
| `tags` | Rendered as small pill labels in both places |
| `body` | An array of paragraphs, rendered only on the detail page (the full write-up) |
| `links.repo` / `links.demo` | Optional — buttons only render if a value is present |

Because both `/projects` and `/project/:slug` read from this same array,
the two pages can never drift out of sync with each other. There's
exactly one place to edit a project's summary, tags, or write-up.

### 2. `/projects` now renders from data, and cards are real links

`routes/main.js` was updated to `require('../data/projects')` and pass
that array into the view:

```js
router.get('/projects', (req, res) => {
  res.render('main/projects', {
    layout: 'layouts/main-layout',
    page: 'projects',
    pageTitle: 'Projects',
    pageDescription: 'Selected projects and what I learned building them.',
    projects,
  });
});
```

`views/main/projects.ejs` was rewritten to loop over that array instead of
containing hand-written cards, and each card is now an `<a>` tag rather
than a `<div>`:

```ejs
<% projects.forEach(function(project) { %>
  <a class="panel" href="/project/<%= project.slug %>">
    <!-- title, status, summary, tags -->
  </a>
<% }); %>
```

This reused an existing CSS rule (`a.panel { display: block; text-decoration:
none; color: inherit; }`) that had already been written for the homepage's
directory cards, so no new styling was needed to make an entire card
clickable while keeping its layout identical to before. The corner-bracket
hover effect that was already defined on `.panel` applies automatically,
since the link just carries the same class.

### 3. A new route: `GET /project/:slug`

```js
router.get('/project/:slug', (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);

  if (!project) {
    return res.status(404).render('main/project-not-found', {
      layout: 'layouts/main-layout',
      page: 'projects',
      pageTitle: 'Project Not Found',
    });
  }

  res.render('main/project-detail', {
    layout: 'layouts/main-layout',
    page: 'projects',
    pageTitle: project.title,
    pageDescription: project.summary,
    project,
  });
});
```

`:slug` is an Express route parameter — it captures whatever comes after
`/project/` in the URL and makes it available as `req.params.slug`.
`Array.prototype.find` then does a straightforward lookup for a project
whose `slug` matches. No database is involved; this is just an in-memory
array search, which is appropriate since project content doesn't change
at runtime.

If nothing matches, the route responds with a real `404` status (not a
`200` with an error message — this matters for SEO and for anything that
checks status codes) and renders a dedicated not-found page instead of
falling through to Express's default error page.

### 4. `views/main/project-detail.ejs` — the report page itself

The detail page has four parts, top to bottom:

1. **Header** — an eyebrow line showing "Project Report — `<status>`",
   the project title as an `<h1>`, and the summary as intro text
2. **Details panel** — a single `.panel` (the same signature component
   used everywhere else on the site) containing the tag list, plus
   conditionally-rendered "Repo ↗" / "Live Demo ↗" buttons:
   ```ejs
   <% if (project.links.repo) { %>
     <a class="btn" href="<%= project.links.repo %>" target="_blank" rel="noopener">Repo ↗</a>
   <% } %>
   ```
   These buttons only appear if a URL was actually provided in the data
   file — an empty string is falsy in JS, so the `if` skips rendering
   rather than producing a dead link.
3. **Write-up** — each entry in the project's `body` array becomes its
   own paragraph, in order
4. **Back link** — a button back to `/projects`

### 5. `views/main/project-not-found.ejs`

A minimal on-brand 404 page — same layout, same styling, a short message,
and a button back to `/projects` — shown whenever a slug in the URL
doesn't match anything in `data/projects.js`.

## How a Click Flows Through the App

```
Browser: GET /projects
   │
   ▼
routes/main.js  ──requires──▶  data/projects.js  (array of project objects)
   │
   ▼
views/main/projects.ejs
   renders one <a class="panel" href="/project/<slug>"> per project
   │
   │  user clicks a card
   ▼
Browser: GET /project/personal-site
   │
   ▼
routes/main.js
   projects.find(p => p.slug === 'personal-site')
   │
   ├── found ──▶ views/main/project-detail.ejs   (200)
   │
   └── not found ──▶ views/main/project-not-found.ejs   (404)
```

## Why This Structure

- **One file to edit per project.** Adding a fourth project means adding
  one object to `data/projects.js` — the list page picks it up
  automatically (it just loops over the array), and it immediately gets
  its own working `/project/<slug>` page with zero template changes.
- **List and detail content can't disagree with each other.** Since both
  views pull from the same array, there's no risk of the summary on the
  card saying one thing and the detail page saying another after an edit.
- **No database needed.** This fits the existing architecture decision
  that the main site has no DB dependency — project data is static
  content, so a plain JS module is the right amount of infrastructure for
  it, consistent with the site staying up even if MongoDB (used only by
  Labs) isn't available.
- **Graceful handling of missing/placeholder data.** Empty `links.repo` /
  `links.demo` values simply don't render a button, so placeholder
  projects (like the current `project-two` and `project-three` entries)
  don't show broken or dead links.

## Current State

- `/projects` lists all projects from `data/projects.js`; each card is a
  full link to its detail page
- `/project/<slug>` renders a full write-up for any known project, or a
  proper `404` page for an unknown one
- Two of the three current projects (`project-two`, `project-three`) still
  contain placeholder `TODO` content in `data/projects.js` and empty link
  fields — these are flagged in the file itself and just need real content
  swapped in
