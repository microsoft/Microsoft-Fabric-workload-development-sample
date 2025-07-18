/**
 * DevServer APIs index file
 * Exports all API routers for the dev server
 */

const manifestApi = require('./manifestApi');

/**
 * Register all dev server APIs with an Express application
 * @param {object} app Express application
 */
function registerDevServerApis(app) {
  console.log('*** Mounting Manifest API ***');
  app.use('/', manifestApi);

  // Redirect root path
  app.get('/', (req, res) => {
      res.redirect('/DevWorkspace');
  });

  // Development redirects to make it easier to access the Fabric dev scenarios
  // Add redirect for /WorkloadL2 to Fabric workload hub  
  app.get('/WorkloadL2', (req, res) => {
      res.redirect(`https://app.fabric.microsoft.com/workloadhub/detail/${process.env.WORKLOAD_NAME}.Product?experience=fabric-developer`);
  });

  // Add redirect for /DevWorkspace to Fabric workload hub
  app.get('/DevWorkspace', (req, res) => {
      res.redirect(`https://app.fabric.microsoft.com/groups/${process.env.DEV_WORKSPACE_ID}/list?experience=fabric-developer`);
  });
}

module.exports = {
  manifestApi,
  registerDevServerApis
};