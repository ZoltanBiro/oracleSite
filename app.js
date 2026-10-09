require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./config/db');
const mainRoutes = require('./routes/main');
const labsRoutes = require('./routes/labs');

const app = express();
app.set('trust proxy',1);
const PORT = process.env.PORT || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout'); // default layout; labs routes override per-request

// ---------- Core middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static assets — main site and labs are kept in separate public subfolders
// so the two sections never share CSS/JS by accident.
app.use('/assets/main', express.static(path.join(__dirname, 'public/main')));
app.use('/assets/labs', express.static(path.join(__dirname, 'public/labs')));

// ---------- Session (used by Labs auth only, but set up globally) ----------
// Labs apps that need login will read req.session.user. Main site ignores this entirely.
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGO_URI
    ? MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' })
    : undefined, // falls back to MemoryStore if no Mongo URI set yet (fine for early dev)
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production',
  },
}));

// ---------- Routes ----------
app.use('/', mainRoutes);
app.use('/labs', labsRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).render('main/404', {
    layout: 'layouts/main-layout',
    title: 'Page Not Found',
  });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke on the server side.');
});

// ---------- Startup ----------
// MongoDB is only required by Labs, so we connect but don't block the main site on it.
connectDB();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
