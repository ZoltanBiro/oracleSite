const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const projects = require('../data/projects');
const posts = require('../data/posts');
const siteLinks = require('../data/site-links');

// This router only owns the main-site pages. Leave Labs and NZT routers alone.
const LAYOUT = 'layouts/main-layout';

router.use((req, res, next) => {
  res.locals.siteLinks = siteLinks;
  next();
});

router.get('/', (req, res) => {
  res.render('main/home', {
    layout: LAYOUT,
    page: 'home',
    pageTitle: 'Home',
    pageDescription: 'Projects, writing and small experiments by Zoltan Biro.',
    projects,
    posts,
  });
});

router.get('/about', (req, res) => {
  res.render('main/about', {
    layout: LAYOUT,
    page: 'about',
    pageTitle: 'About',
    pageDescription: 'More about Zoltan Biro, outside of the resume version.',
  });
});

router.get('/projects', (req, res) => {
  res.render('main/projects', {
    layout: LAYOUT,
    page: 'projects',
    pageTitle: 'Projects',
    pageDescription: 'Projects I have built and what I learned from them.',
    projects,
  });
});

router.get('/project/:slug', (req, res) => {
  const project = projects.find((entry) => entry.slug === req.params.slug);
  if (!project) {
    return res.status(404).render('main/project-not-found', {
      layout: LAYOUT,
      page: 'projects',
      pageTitle: 'Project Not Found',
      pageDescription: 'That project could not be found.',
    });
  }

  res.render('main/project-detail', {
    layout: LAYOUT,
    page: 'projects',
    pageTitle: project.title,
    pageDescription: project.summary,
    project,
  });
});

router.get('/resume', (req, res) => {
  // The original archive doesn't include a PDF. Only show download when present.
  const hasResumePdf = fs.existsSync(path.join(__dirname, '../public/main/resume.pdf'));
  res.render('main/resume', {
    layout: LAYOUT,
    page: 'resume',
    pageTitle: 'Resume',
    pageDescription: 'Experience, education and technical skills.',
    hasResumePdf,
  });
});

router.get('/blog', (req, res) => {
  res.render('main/blog', {
    layout: LAYOUT,
    page: 'blog',
    pageTitle: 'Writing',
    pageDescription: 'Notes on whatever I find interesting.',
    posts,
  });
});

module.exports = router;
