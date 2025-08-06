/**
 * Manifest API implementation
 * Handles serving of manifest metadata and package files
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { buildManifestPackage } = require('./build-manifest');

const router = express.Router();

/**
 * OPTIONS handler for CORS preflight requests
 */
router.options('/manifests_new*', (req, res) => {
  res.header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400' // 24 hours
  });
  res.sendStatus(204); // No content needed for OPTIONS response
  console.log("Handled CORS preflight request for manifest endpoint.");
});

/**
 * GET /manifests_new/metadata
 * Returns metadata about the manifest
 */
router.get('/manifests_new/metadata', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });

  const devParameters = {
    name: process.env.WORKLOAD_NAME,
    url: "http://127.0.0.1:60006",
    devAADFEAppConfig: {
      appId: process.env.DEV_AAD_CONFIG_FE_APPID,
    }
  };

  res.end(JSON.stringify({ extension: devParameters }));
  console.log("Deliverd manifest metainformation successfully.");
});

/**
 * GET /manifests_new
 * Builds and returns the manifest package
 */
router.get('/manifests_new', async (req, res) => {
  try {
    await buildManifestPackage(); // Wait for the build to complete before accessing the file
    const filePath = path.resolve(__dirname, `../../build/Manifest/${process.env.WORKLOAD_NAME}.${process.env.WORKLOAD_VERSION}.nupkg`);
    // Check if the file exists
    await fs.access(filePath);

    res.status(200).set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="ManifestPackage.1.0.0.nupkg"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    res.sendFile(filePath);
    console.log("Deliverd manifest package successfully.");
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    res.status(500).json({
      error: "Failed to serve manifest package",
      details: err.message
    });
  }
});

module.exports = router;