/**
 * Jobs API implementation stubs
 * Based on swagger.json for Microsoft Fabric Workload API
 */

const express = require('express');
const { JobInstanceStatus, ErrorSource } = require('./types');

const router = express.Router();

/**
 * Called by Microsoft Fabric for starting a new job instance.
 * 
 * Fabric performs basic validations and calls this API to start a new instance of the job in the workload.
 */
router.post('/workspaces/:workspaceId/items/:itemType/:itemId/jobTypes/:jobType/instances/:jobInstanceId', 
  (req, res) => {
    const { workspaceId, itemType, itemId, jobType, jobInstanceId } = req.params;
    const createJobInstanceRequest = req.body;
    
    try {
      // TODO: Implementation logic
      // 1. Validate the request
      // 2. Start a new job instance
      // 3. Store job instance metadata
      
      console.log(`Creating job instance: ${jobInstanceId} of type ${jobType} for item ${itemId} in workspace ${workspaceId}`);
      console.log('Invoke type:', createJobInstanceRequest.invokeType);
      
      // Successful response - 202 Accepted for job that will run asynchronously
      res.status(202).send();
    } catch (error) {
      const errorResponse = {
        errorCode: 'InternalServerError',
        message: 'Failed to create job instance',
        source: ErrorSource.System
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * Called by Microsoft Fabric for retrieving a job instance state.
 * 
 * Fabric performs basic validations and calls this API to retrieve the item job instance state in the workload.
 */
router.get('/workspaces/:workspaceId/items/:itemType/:itemId/jobTypes/:jobType/instances/:jobInstanceId', 
  (req, res) => {
    const { workspaceId, itemType, itemId, jobType, jobInstanceId } = req.params;
    
    try {
      // TODO: Implementation logic
      // 1. Retrieve job instance state
      
      console.log(`Getting state for job instance: ${jobInstanceId} of type ${jobType} for item ${itemId} in workspace ${workspaceId}`);
      
      // Example job instance state response
      const response = {
        status: JobInstanceStatus.InProgress,
        startTimeUtc: new Date().toISOString(),
        // No endTimeUtc since it's still in progress
      };
      
      // Successful response
      res.status(200).json(response);
    } catch (error) {
      const errorResponse = {
        errorCode: 'InternalServerError',
        message: 'Failed to get job instance state',
        source: ErrorSource.System
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * Called by Microsoft Fabric for cancelling a job instance.
 * 
 * Fabric performs basic validations and calls this API to cancel an item job instance in the workload.
 */
router.post('/workspaces/:workspaceId/items/:itemType/:itemId/jobTypes/:jobType/instances/:jobInstanceId/cancel', 
  (req, res) => {
    const { workspaceId, itemType, itemId, jobType, jobInstanceId } = req.params;
    
    try {
      // TODO: Implementation logic
      // 1. Cancel the job instance
      // 2. Update job instance metadata
      
      console.log(`Cancelling job instance: ${jobInstanceId} of type ${jobType} for item ${itemId} in workspace ${workspaceId}`);
      
      // Example job instance state response after cancellation
      const response = {
        status: JobInstanceStatus.Cancelled,
        startTimeUtc: new Date(Date.now() - 3600000).toISOString(), // Example: started 1 hour ago
        endTimeUtc: new Date().toISOString() // Ended now (when cancelled)
      };
      
      // Successful response
      res.status(200).json(response);
    } catch (error) {
      const errorResponse = {
        errorCode: 'InternalServerError',
        message: 'Failed to cancel job instance',
        source: ErrorSource.System
      };
      res.status(500).json(errorResponse);
    }
  }
);

module.exports = router;