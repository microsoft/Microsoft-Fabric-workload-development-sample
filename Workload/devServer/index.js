/**
 * DevServer APIs index file
 * Exports all API routers for the dev server
 */

const manifestApi = require('./manifestApi');
const schemaApi = require('./schemaApi')

/**
 * Register all dev server APIs with an Express application
 * @param {object} app Express application
 */
function registerDevServerApis(app) {
  console.log('*** Mounting Manifest API ***');
  app.use('/', manifestApi);
  app.use('/', schemaApi);
}

module.exports = {
  manifestApi,
  registerDevServerApis
};
