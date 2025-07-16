/**
 * Samples API index file
 * Exports API routers for the sample APIs
 */

const jobsApi = require('./jobsApi');
const endpointResolutionApi = require('./endpointResolutionApi');

/**
 * Register all Fabric workload APIs with an Express application
 * @param {object} app Express application
 */
function registerFabricRemoteWorkloadApis(app) {
  console.log('*** Mounting Jobs API ***');
  app.use('/', jobsApi);
  
  console.log('*** Mounting Endpoint Resolution API ***');
  app.use('/', endpointResolutionApi);
}

module.exports = {
  jobsApi,
  endpointResolutionApi,
  registerFabricRemoteWorkloadApis
};