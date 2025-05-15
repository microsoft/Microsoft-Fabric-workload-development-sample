# Propagating errors from the workload backend to the workload frontend
To propagate any errors that occur in the workload backend to the workload frontend when working with control plane APIs (CRUD/Jobs **with the exception of GetItemJobInstanceStateAsync**), the workload backend should return an error status code and the response body content should be a serialized JSON of the class "ErrorResponse" that is a part of the contracts in the workload backend. 

            var errorResponse = new ErrorResponse
            {
                ErrorCode = ErrorCode,
                Message = ErrorMessage,
                MessageParameters = _messageParameters.Any() ? _messageParameters : null,
                Source = ErrorSource,
                IsPermanent = IsPermanent,
                MoreDetails = Details,
            };
            
            
            return new ContentResult
            {
                StatusCode = (int)HttpStatusCode,
                Content = JsonSerializer.Serialize(errorResponse),
                ContentType = MediaTypeNames.Application.Json,
            };

You can see examples in HttpResponseExceptionFilter.cs when calling "ToHttpActionResult" on exceptions in the backend sample.

When the content is a JSON of the class ErrorResponse, the error is propgated through Fabric and passed to the workload frontend, the error code in that case is "FabricExternalWorkloadError".
To parse the content, the workload frontend should use WorkloadErrorDetails from @ms-fabric/workload-client.

An example of error propagation regarding authentication UI required exceptions is implemented in the sample (see FabricExternalWorkloadError in SampleWorkloadController.ts in the frontend sample).

For GetItemJobInstanceStateAsync, the workload backend should return the error as a part of ItemJobInstanceState.
