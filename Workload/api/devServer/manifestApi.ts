/**
 * Manifest API implementation
 * Handles serving of manifest metadata and package files
 */

import express, { Request, Response, Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

// Using CommonJS require for the build-manifest.js module
const { buildManifestPackage } = require('../../../devServer/build-manifest');

const router = express.Router();

/**
 * GET /manifests_new/metadata
 * Returns metadata about the manifest
 */
router.get('/manifests_new/metadata', (req: Request, res: Response) => {
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
});

/**
 * GET /manifests_new
 * Builds and returns the manifest package
 */
router.get('/manifests_new', async (req: Request, res: Response) => {
  try {
    await buildManifestPackage(); // Wait for the build to complete before accessing the file
    const filePath = path.resolve(__dirname, '../../../../config/Manifest/ManifestPackage.1.0.0.nupkg');
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
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to serve manifest package",
      details: error.message
    });
  }
});

export default router;