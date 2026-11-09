const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Ensure resilient SRV resolution for MongoDB Atlas across all network environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const readRoutes = require('./routes/readRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', readRoutes);

// MongoDB connection (Optional: if not provided, runs in in-memory / zero-database mode)
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Database: MongoDB connected)`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      console.log('Starting server in fallback mode (without MongoDB cache)...');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Database: In-Memory / No-DB mode)`);
      });
    });
} else {
  console.log('NOTICE: MONGODB_URI is not set. Running in memory / serverless-friendly mode without persistent DB caching.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Database: In-Memory / No-DB mode)`);
  });
}
