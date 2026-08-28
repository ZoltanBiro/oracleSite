const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const LAYOUT = 'layouts/nzt-layout';

const ARTICLES_DIR = path.join(__dirname, '../data/nzt/articles');
const ISSUES_DIR = path.join(__dirname, '../data/nzt/issues');


/*
 * Read every .json file in a directory.
 *
 * Each file should contain ONE object, not an array.
 */
function loadJsonDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.warn(`[NZT] Directory does not exist: ${directory}`);
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const filePath = path.join(directory, file);

      try {
        const contents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(contents);
      } catch (error) {
        console.error(`[NZT] Failed to load ${file}:`, error.message);
        return null;
      }
    })
    .filter(Boolean);
}


/*
 * Load publication content when the Express process starts.
 *
 * Since NZT content is deployed through Git, pm2 will normally be
 * restarted after a deploy anyway.
 */
const articles = loadJsonDirectory(ARTICLES_DIR);

const issues = loadJsonDirectory(ISSUES_DIR)
  .sort((a, b) => {
    return new Date(b.published) - new Date(a.published);
  });


/*
 * Fast article lookup:
 *
 * articlesBySlug.get('welcome-to-new-zork')
 */
const articlesBySlug = new Map();

articles.forEach((article) => {
  if (!article.slug) {
    console.warn('[NZT] Article found without a slug:', article);
    return;
  }

  if (articlesBySlug.has(article.slug)) {
    console.warn(`[NZT] Duplicate article slug: ${article.slug}`);
  }

  articlesBySlug.set(article.slug, article);
});


/*
 * Fast issue lookup.
 */
const issuesBySlug = new Map();

issues.forEach((issue) => {
  if (!issue.slug) {
    console.warn('[NZT] Issue found without a slug:', issue);
    return;
  }

  if (issuesBySlug.has(issue.slug)) {
    console.warn(`[NZT] Duplicate issue slug: ${issue.slug}`);
  }

  issuesBySlug.set(issue.slug, issue);
});


function getArticle(slug) {
  return articlesBySlug.get(slug);
}


/*
 * An issue JSON only stores article slugs.
 *
 * This converts those slugs into the full article objects
 * before handing the issue to EJS.
 */
function hydrateIssue(issue) {
  if (!issue) {
    return null;
  }

  const lead = getArticle(issue.lead);

  const secondary = (issue.secondary || [])
    .map(getArticle)
    .filter(Boolean);

  const sections = (issue.sections || []).map((section) => ({
    ...section,

    stories: (section.stories || [])
      .map(getArticle)
      .filter(Boolean),
  }));

  return {
    ...issue,
    lead,
    secondary,
    sections,
  };
}


function renderNotFound(
  res,
  message = 'That page did not make this edition.'
) {
  return res.status(404).render('nzt/not-found', {
    layout: LAYOUT,
    pageTitle: 'Not Found',
    pageDescription: message,
    message,
  });
}


/*
 * GET /nzt
 *
 * Latest issue.
 *
 * Issues are sorted newest -> oldest using their
 * "published" ISO date.
 */
router.get('/', (req, res) => {
  const issue = hydrateIssue(issues[0]);

  if (!issue) {
    return res.status(503).render('nzt/not-found', {
      layout: LAYOUT,
      pageTitle: 'No Edition Available',
      pageDescription:
        'The New Zork Times does not have a published edition yet.',
      message: 'No edition has been published yet.',
    });
  }

  res.render('nzt/index', {
    layout: LAYOUT,
    pageTitle: 'Latest Edition',
    pageDescription:
      issue.description ||
      'The latest edition of the New Zork Times.',
    issue,
  });
});


/*
 * GET /nzt/archive
 */
router.get('/archive', (req, res) => {
  res.render('nzt/archive', {
    layout: LAYOUT,
    pageTitle: 'Archive',
    pageDescription: 'Past editions of the New Zork Times.',
    issues,
  });
});


/*
 * GET /nzt/issue/:slug
 */
router.get('/issue/:slug', (req, res) => {
  const rawIssue = issuesBySlug.get(req.params.slug);
  const issue = hydrateIssue(rawIssue);

  if (!issue) {
    return renderNotFound(
      res,
      'That edition could not be found in the archive.'
    );
  }

  res.render('nzt/issue', {
    layout: LAYOUT,
    pageTitle:
      issue.label ||
      issue.displayDate ||
      'New Zork Times',

    pageDescription:
      issue.description ||
      `New Zork Times edition for ${issue.displayDate}.`,

    issue,
  });
});


/*
 * GET /nzt/article/:slug
 */
router.get('/article/:slug', (req, res) => {
  const article = getArticle(req.params.slug);

  if (!article) {
    return renderNotFound(
      res,
      'That story could not be found.'
    );
  }

  res.render('nzt/article', {
    layout: LAYOUT,
    pageTitle: article.headline,

    pageDescription:
      article.dek ||
      article.excerpt ||
      article.headline,

    article,
  });
});


module.exports = router;