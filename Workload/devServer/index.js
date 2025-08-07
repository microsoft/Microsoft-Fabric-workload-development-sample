/**
 * DevServer APIs index file
 * Exports all API routers for the dev server
 */

const manifestApi = require('./manifestApi');
const unityCatalogApi = require('../api/UnityCatalog/routes');
const schemaApi = require('./schemaApi')

/**
 * Register all dev server APIs with an Express application
 * @param {object} app Express application
 */
function registerDevServerApis(app) {
  console.log('*** Starting Dev Server API Registration ***');
  
  console.log('*** Mounting Manifest API ***');
  app.use('/', manifestApi);
  
  console.log('*** Dev Server API Registration Complete ***');
  app.use('/', schemaApi);

  console.log('*** Mounting Unity Catalog CORS Wrapper API ***');
  console.log('    - Unity Catalog proxy routes available at /api/unity-catalog/*');
  console.log('    - Endpoints: /test-connection, /catalogs, /schemas, /tables, /external-tables');
  app.use('/api/unity-catalog', unityCatalogApi);
}

module.exports = {
  manifestApi,
  unityCatalogApi,
  registerDevServerApis
};
