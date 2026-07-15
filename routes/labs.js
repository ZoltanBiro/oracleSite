const express = require('express');
const router = express.Router();

const LAYOUT = 'layouts/labs-layout';

// Labs landing page — lists every experiment with a one-liner.
// Swap this stub array for a Mongo-backed list later if you want it dynamic;
// for now a hardcoded array is fine since new labs apps are added by hand anyway.
router.get('/', (req, res) => {
  const apps = [
    {
      slug: 'example-app',
      name: 'Example App',
      blurb: 'Placeholder entry — replace with your first real lab.',
      status: 'in-progress',
    },
  ];

  res.render('labs/index', {
    layout: LAYOUT,
    title: 'Labs',
    apps,
  });
});

// ---------------------------------------------------------------
// Individual labs apps get mounted below as their own sub-routers,
// each with its own MongoDB collection(s) to avoid schema collisions.
// Example pattern for when you add one:
//
//   const exampleApp = require('./labs/example-app');
//   router.use('/example-app', exampleApp);
//
// Each labs app's router lives in routes/labs/<app-name>.js and owns
// its own models (models/<app-name>/...), views (views/labs/<app-name>/...),
// and — if it needs auth — its own login/session checks using the shared
// express-session middleware already set up in app.js.
// ---------------------------------------------------------------

module.exports = router;
