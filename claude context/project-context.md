# Personal Website Project — Context

## Overview
Building a personal website with two distinct parts:

1. **Main site** — a professional personal/portfolio site (standard comp sci grad setup)
2. **Labs section** — a sandbox of small, low-traffic apps built to stay sharp technically

## Who this is for
Early-career / student comp sci background. Portfolio needs to demonstrate potential and ability rather than lean on a long work history. The projects section is the primary credibility-builder.

## Main Site Structure
- **Intro/About** — who I am, what I'm into, short personal pitch
- **Portfolio/Projects** — best 3-5 projects, each with a short writeup (problem, stack, what I learned, link/demo)
- **Resume/Experience** — coursework, internships, relevant skills
- **Contact** — GitHub, LinkedIn, email, etc.
- Static in nature — no dynamic/changing data expected, so no database needed for this section

## Labs Section
- **Branding decision: distinct vibe, same site.** Labs shares the same domain/nav as the main site, but gets its own visual treatment/feel, separate from the polished main-site design. (Exact visual direction for that "distinct vibe" is still undecided — open question.)
- A landing/index page listing each small app with a one-liner on what it does and why it was built
- Apps here are explicitly experiments — can be unpolished, half-finished, or weirdly specific. The point is to show range, curiosity, and ongoing skill-building, not deliver production-grade work
- Worth labeling clearly so visitors calibrate expectations (these aren't held to the same bar as the portfolio)
- **Data isolation:** each labs app gets its own MongoDB collection (or logical grouping), so experiments don't collide schemas with each other as they evolve
- **Auth:** at least some labs apps will need login/password functionality. Plan is session-based auth with Express (e.g. express-session + connect-mongo) and bcrypt for password hashing — not yet implemented, just the intended approach

## Motivation for Labs Apps
Building these for a mix of reasons:
- Learning new tech/frameworks
- Solving small personal problems/tools worth having
- General fullstack practice

## Tech Stack (decided)
- **Server:** Node.js with Express (routing, full middleware setup)
- **Templating:** EJS (some prior familiarity from school)
- **Static assets:** standard `/public` folder convention via `express.static`
- **Frontend:** Plain HTML/CSS/vanilla JS — no React, intentionally avoiding frameworks for now since the comfort zone is plain HTML/CSS
- **Database:** MongoDB — used only for Labs section data (auth, per-app data). Main/personal site has no DB needs.
- **Process management:** pm2, to keep the Node app alive across crashes/reboots

## Hosting / Deployment (decided)
- **Current host:** Oracle Cloud Free Tier — E2.1.Micro instance (1 OCPU, 1GB RAM), x86
- **Domain:** zoltanbiro.ca, pointed at the Oracle VM
- **Reverse proxy:** Nginx sits on ports 80/443, handles SSL termination, proxies to Express on 8080
- **SSL:** Let's Encrypt cert via Certbot — free, auto-renewing. HTTPS is set up (or in progress).
- **Oracle firewall note:** Oracle Cloud has two firewall layers — Security Lists/NSGs in the console AND OS-level iptables/ufw. Both need port 443 open for HTTPS to work.
- **Known constraint:** 1GB RAM is tight for running Node + MongoDB on the same box. Noted as a real but currently-acceptable constraint — will revisit (e.g. swapfile, offloading DB to MongoDB Atlas free tier, etc.) if/when it becomes an actual problem. Not solving preemptively.
- **Upgrade path:** Eyeing Oracle's ARM Ampere free tier (typically 4 OCPU / 24GB RAM) once availability opens up. This would substantially loosen the memory constraint — current memory-conscious decisions are "for now," not permanent architecture.

## Open Questions / Decisions Not Yet Made
- Visual direction for Labs' "distinct vibe" (specific aesthetic/design system separate from main site)
- Specific labs app ideas (not yet brainstormed)
- Whether to run MongoDB locally on the instance or offload to Atlas (currently leaning local/running it ourselves for now, per stack decision, but open to revisit under memory pressure)

## Status
Stack and hosting decisions locked in. Structure for main site and Labs section agreed upon. Express app scaffolding in progress. Nginx + SSL (Let's Encrypt/Certbot) setup in progress. Next steps: finish SSL setup, continue building out EJS layout/partials, brainstorm Labs app ideas.
