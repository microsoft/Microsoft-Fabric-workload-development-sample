const express = require('express');
const { testConnection, listCatalogs, listSchemas, listTables, getExternalTables } = require('./index');

const router = express.Router();

// Middleware to log Unity Catalog API requests
router.use((req, res, next) => {
  console.log(`[Unity Catalog API] ${req.method} ${req.originalUrl}`);
  console.log(`[Unity Catalog API] Body:`, req.body ? Object.keys(req.body) : 'empty');
  next();
});

// Unity Catalog API proxy routes
router.post('/test-connection', testConnection);
router.post('/catalogs', listCatalogs);
router.post('/schemas', listSchemas);
router.post('/tables', listTables);
router.post('/external-tables', getExternalTables);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Unity Catalog CORS wrapper is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
