const express = require('express');
const router = express.Router();
const projects = require('../data/projects');
const posts = require('../data/posts');

router.get('/', (req, res) => {
  res.render('main/home', {
    layout: 'layouts/main-layout',
    page: 'home',
    pageTitle: 'Home',
    pageDescription: 'Personal site and portfolio of Zoltan Biro.',
  });
});

router.get('/about', (req, res) => {
  res.render('main/about', {
    layout: 'layouts/main-layout',
    page: 'about',
    pageTitle: 'About',
    pageDescription: 'A little about who I am and what I build.',
  });
});

router.get('/projects', (req, res) => {
  res.render('main/projects', {
    layout: 'layouts/main-layout',
    page: 'projects',
    pageTitle: 'Projects',
    pageDescription: 'Selected projects and what I learned building them.',
    projects,
  });
});

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

router.get('/resume', (req, res) => {
  res.render('main/resume', {
    layout: 'layouts/main-layout',
    page: 'resume',
    pageTitle: 'Resume',
    pageDescription: 'Coursework, experience, and skills.',
  });
});

router.get('/blog', (req, res) => {
  res.render('main/blog', {
    layout: 'layouts/main-layout',
    page: 'blog',
    pageTitle: 'Blog',
    pageDescription: 'Notes and write-ups on tech, infra, and whatever else.',
    posts,
  });
});

module.exports = router;

