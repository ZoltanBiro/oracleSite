const mongoose = require('mongoose');

// MongoDB is used ONLY by the Labs section (auth + per-app data).
// The main portfolio site never touches this.
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('[db] No MONGO_URI set — skipping MongoDB connection. Labs features that need it will fail until this is configured.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    // Intentionally not exiting the process — the main site should keep working
    // even if Labs' database is unavailable.
  }
}

module.exports = connectDB;
