/**
 * Jobs API implementation stubs
 * Based on swagger.json for Microsoft Fabric Workload API
 */

const express = require('express');
const { JobInstanceStatus, ErrorSource } = require('./types');
const { start } = require('repl');

const router = express.Router();


const jobInstances = new Map();

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
      jobInstances.put(jobInstanceId, {
        workspaceId: workspaceId,
        itemId: itemId,
        itemType: itemType,
        jobType: jobType,
        jobInstanceId: jobInstanceId,
        status: JobInstanceStatus.InProgress,
        startTimeUtc: new Date().toISOString(),
        endTimeUtc: null, // No endTimeUtc since it's still in progress
        invokeType: createJobInstanceRequest.invokeType,
      })
      
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
      var jobInfo = jobInstances.get(jobInstanceId);
      // Example job instance state response
      const response = {
        status: jobInfo?.status,
        startTimeUtc: jobInfo?.startTimeUtc.toISOString(),
        endTimeUtc: jobInfo?.endTimeUtc?.toISOString() 
      };

      jobInfo.status = JobInstanceStatus.Completed; // Simulate completion for demo
      
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
      var jobInfo = jobInstances.get(jobInstanceId);
      if (!jobInfo) {
        return res.status(404).json({
          errorCode: 'JobInstanceNotFound',
          message: `Job instance ${jobInstanceId} not found`,
          source: ErrorSource.System
        });
      } else {
        jobInfo.status = JobInstanceStatus.Cancelled;
        jobInfo.endTimeUtc = new Date().toISOString();
      }
      // Example job instance state response after cancellation
      const response = {
        status: jobInfo?.status,
        startTimeUtc: jobInfo?.startTimeUtc.toISOString(),
        endTimeUtc: jobInfo?.endTimeUtc?.toISOString() 
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