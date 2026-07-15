// Single source of truth for project content — used by both the /projects
// list page and the /project/:slug detail page, so they never drift apart.
//
// To add a project: add an object here with a unique `slug` (used in the
// URL as /project/<slug>) and it'll show up on both pages automatically.

module.exports = [
  {
    slug: 'personal-site',
    title: 'Self-Hosted Personal Site',
    status: 'Live',
    summary:
      "This site. A Node/Express app behind Nginx with Let's Encrypt TLS, deployed on an Oracle Cloud free-tier instance and kept alive with pm2. Includes a sandboxed Labs section for smaller experiments with session-based auth.",
    tags: ['Node.js', 'Express', 'Nginx', 'MongoDB', 'pm2'],
    body: [
      "This site runs as a single Express app split into two logical sections — a static main site and a sandboxed Labs area — sitting behind Nginx, which terminates TLS and reverse-proxies everything to the app on port 8080.",
      "The whole process is kept alive by pm2, running in fork mode with a memory ceiling, since it shares a 1 vCPU / 1GB RAM Oracle Cloud free-tier instance with MongoDB.",
      "The trickiest part was getting session cookies to work correctly behind the reverse proxy — Express needed to be told to trust Nginx's forwarded headers before secure cookies (and therefore login on the Labs side) would work at all.",
    ],
    links: {
      repo: 'https://github.com/YOUR-USERNAME/personal-site',
      demo: 'https://zoltanbiro.ca',
    },
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    status: 'In Progress',
    summary:
      'One or two sentences on the problem this solved, then a sentence on what was learned building it.',
    tags: ['Stack', 'Goes', 'Here'],
    body: [
      'TODO: replace this with a real write-up — what problem the project solves, why you built it, and how it works under the hood.',
      'A good structure is usually: the problem, the approach, one interesting technical decision, and what you\'d do differently next time.',
    ],
    links: {
      repo: '',
      demo: '',
    },
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    status: 'Archived',
    summary: 'Same shape: what it does, what it\'s built with, what you\'d learn from reading the code.',
    tags: ['Stack', 'Goes', 'Here'],
    body: [
      'TODO: replace this with a real write-up.',
    ],
    links: {
      repo: '',
      demo: '',
    },
  },
];

