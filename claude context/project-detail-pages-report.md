\# Project Detail Pages Report — zoltanbiro.ca

&#x20;

\## Summary

&#x20;

Project cards on `/projects` are now clickable and lead to a dedicated

report page for each project at `/project/<slug>`. Rather than duplicating

project content between a list view and separate detail views, all project

data now lives in one shared file, and both the list page and the detail

page read from it. Adding a new project going forward means adding one

object to that file — no template changes required.

&#x20;

\## Starting Point

&#x20;

Before this work:

\- Project cards on `/projects` were static HTML, hand-written directly into

&#x20; `views/main/projects.ejs`

\- Cards were not links — there was no way to click through to more detail

&#x20; on a given project

\- There was no concept of a per-project page or URL

\## What Was Built

&#x20;

\### 1. A single source of truth: `data/projects.js`

&#x20;

All project content — the stuff that used to be hardcoded into the

`projects.ejs` template — was pulled out into a plain JS module that

exports an array of project objects:

&#x20;

```js

module.exports = \[

&#x20; {

&#x20;   slug: 'personal-site',

&#x20;   title: 'Self-Hosted Personal Site',

&#x20;   status: 'Live',

&#x20;   summary: '...',

&#x20;   tags: \['Node.js', 'Express', 'Nginx', 'MongoDB', 'pm2'],

&#x20;   body: \[ '...', '...', '...' ],   // one array entry per paragraph

&#x20;   links: { repo: '...', demo: '...' },

&#x20; },

&#x20; // ...more projects

];

```

&#x20;

Each field has a specific job:

&#x20;

| Field | Used for |

|---|---|

| `slug` | The URL segment — `/project/<slug>` |

| `title`, `status`, `summary` | Shown on both the list card and the detail page header |

| `tags` | Rendered as small pill labels in both places |

| `body` | An array of paragraphs, rendered only on the detail page (the full write-up) |

| `links.repo` / `links.demo` | Optional — buttons only render if a value is present |

&#x20;

Because both `/projects` and `/project/:slug` read from this same array,

the two pages can never drift out of sync with each other. There's

exactly one place to edit a project's summary, tags, or write-up.

&#x20;

\### 2. `/projects` now renders from data, and cards are real links

&#x20;

`routes/main.js` was updated to `require('../data/projects')` and pass

that array into the view:

&#x20;

```js

router.get('/projects', (req, res) => {

&#x20; res.render('main/projects', {

&#x20;   layout: 'layouts/main-layout',

&#x20;   page: 'projects',

&#x20;   pageTitle: 'Projects',

&#x20;   pageDescription: 'Selected projects and what I learned building them.',

&#x20;   projects,

&#x20; });

});

```

&#x20;

`views/main/projects.ejs` was rewritten to loop over that array instead of

containing hand-written cards, and each card is now an `<a>` tag rather

than a `<div>`:

&#x20;

```ejs

<% projects.forEach(function(project) { %>

&#x20; <a class="panel" href="/project/<%= project.slug %>">

&#x20;   <!-- title, status, summary, tags -->

&#x20; </a>

<% }); %>

```

&#x20;

This reused an existing CSS rule (`a.panel { display: block; text-decoration:

none; color: inherit; }`) that had already been written for the homepage's

directory cards, so no new styling was needed to make an entire card

clickable while keeping its layout identical to before. The corner-bracket

hover effect that was already defined on `.panel` applies automatically,

since the link just carries the same class.

&#x20;

\### 3. A new route: `GET /project/:slug`

&#x20;

```js

router.get('/project/:slug', (req, res) => {

&#x20; const project = projects.find((p) => p.slug === req.params.slug);

&#x20;

&#x20; if (!project) {

&#x20;   return res.status(404).render('main/project-not-found', {

&#x20;     layout: 'layouts/main-layout',

&#x20;     page: 'projects',

&#x20;     pageTitle: 'Project Not Found',

&#x20;   });

&#x20; }

&#x20;

&#x20; res.render('main/project-detail', {

&#x20;   layout: 'layouts/main-layout',

&#x20;   page: 'projects',

&#x20;   pageTitle: project.title,

&#x20;   pageDescription: project.summary,

&#x20;   project,

&#x20; });

});

```

&#x20;

`:slug` is an Express route parameter — it captures whatever comes after

`/project/` in the URL and makes it available as `req.params.slug`.

`Array.prototype.find` then does a straightforward lookup for a project

whose `slug` matches. No database is involved; this is just an in-memory

array search, which is appropriate since project content doesn't change

at runtime.

&#x20;

If nothing matches, the route responds with a real `404` status (not a

`200` with an error message — this matters for SEO and for anything that

checks status codes) and renders a dedicated not-found page instead of

falling through to Express's default error page.

&#x20;

\### 4. `views/main/project-detail.ejs` — the report page itself

&#x20;

The detail page has four parts, top to bottom:

&#x20;

1\. \*\*Header\*\* — an eyebrow line showing "Project Report — `<status>`",

&#x20;  the project title as an `<h1>`, and the summary as intro text

2\. \*\*Details panel\*\* — a single `.panel` (the same signature component

&#x20;  used everywhere else on the site) containing the tag list, plus

&#x20;  conditionally-rendered "Repo ↗" / "Live Demo ↗" buttons:

&#x20;  ```ejs

&#x20;  <% if (project.links.repo) { %>

&#x20;    <a class="btn" href="<%= project.links.repo %>" target="\_blank" rel="noopener">Repo ↗</a>

&#x20;  <% } %>

&#x20;  ```

&#x20;  These buttons only appear if a URL was actually provided in the data

&#x20;  file — an empty string is falsy in JS, so the `if` skips rendering

&#x20;  rather than producing a dead link.

3\. \*\*Write-up\*\* — each entry in the project's `body` array becomes its

&#x20;  own paragraph, in order

4\. \*\*Back link\*\* — a button back to `/projects`

\### 5. `views/main/project-not-found.ejs`

&#x20;

A minimal on-brand 404 page — same layout, same styling, a short message,

and a button back to `/projects` — shown whenever a slug in the URL

doesn't match anything in `data/projects.js`.

&#x20;

\## How a Click Flows Through the App

&#x20;

```

Browser: GET /projects

&#x20;  │

&#x20;  ▼

routes/main.js  ──requires──▶  data/projects.js  (array of project objects)

&#x20;  │

&#x20;  ▼

views/main/projects.ejs

&#x20;  renders one <a class="panel" href="/project/<slug>"> per project

&#x20;  │

&#x20;  │  user clicks a card

&#x20;  ▼

Browser: GET /project/personal-site

&#x20;  │

&#x20;  ▼

routes/main.js

&#x20;  projects.find(p => p.slug === 'personal-site')

&#x20;  │

&#x20;  ├── found ──▶ views/main/project-detail.ejs   (200)

&#x20;  │

&#x20;  └── not found ──▶ views/main/project-not-found.ejs   (404)

```

&#x20;

\## Why This Structure

&#x20;

\- \*\*One file to edit per project.\*\* Adding a fourth project means adding

&#x20; one object to `data/projects.js` — the list page picks it up

&#x20; automatically (it just loops over the array), and it immediately gets

&#x20; its own working `/project/<slug>` page with zero template changes.

\- \*\*List and detail content can't disagree with each other.\*\* Since both

&#x20; views pull from the same array, there's no risk of the summary on the

&#x20; card saying one thing and the detail page saying another after an edit.

\- \*\*No database needed.\*\* This fits the existing architecture decision

&#x20; that the main site has no DB dependency — project data is static

&#x20; content, so a plain JS module is the right amount of infrastructure for

&#x20; it, consistent with the site staying up even if MongoDB (used only by

&#x20; Labs) isn't available.

\- \*\*Graceful handling of missing/placeholder data.\*\* Empty `links.repo` /

&#x20; `links.demo` values simply don't render a button, so placeholder

&#x20; projects (like the current `project-two` and `project-three` entries)

&#x20; don't show broken or dead links.

\## Current State

&#x20;

\- `/projects` lists all projects from `data/projects.js`; each card is a

&#x20; full link to its detail page

\- `/project/<slug>` renders a full write-up for any known project, or a

&#x20; proper `404` page for an unknown one

\- Two of the three current projects (`project-two`, `project-three`) still

&#x20; contain placeholder `TODO` content in `data/projects.js` and empty link

&#x20; fields — these are flagged in the file itself and just need real content

&#x20; swapped in

