// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
using System;
using System.Security.Authentication;

namespace Boilerplate.Exceptions
{
    public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
    {
        private readonly ILogger<HttpResponseExceptionFilter> _logger;

        public int Order => int.MaxValue - 10;

        public HttpResponseExceptionFilter(ILogger<HttpResponseExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnActionExecuting(ActionExecutingContext context) { }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            switch (context.Exception)
            {
                case MsalUiRequiredException msalUiRequiredException:
                    _logger.LogError("Failed to acquire a token, user interaction is required, returning '401 Unauthorized' with WWW-Authenticate header");
                    AuthenticationService.AddBearerClaimToResponse(msalUiRequiredException, context.HttpContext.Response);
                    context.Result = new StatusCodeResult(StatusCodes.Status401Unauthorized);
                    context.ExceptionHandled = true;
                    break;

                case AuthenticationException authenticationException:
                    _logger.LogError("Failed to authenticate the request");
                    context.Result = new StatusCodeResult(StatusCodes.Status401Unauthorized);
                    context.ExceptionHandled = true;
                    break;

                case WorkloadExceptionBase workloadException:
                    _logger.LogError("Workload exception: {0}\r\n{1}", workloadException, workloadException.ToTelemetryString());
                    context.Result = workloadException.ToHttpActionResult();
                    context.ExceptionHandled = true;
                    break;

                case Exception e:
                    _logger.LogError("Unknown exception: {0}", e);
                    context.Result = new InternalErrorException("Unexpected error").ToHttpActionResult();
                    context.ExceptionHandled = true;
                    break;
            }
        }
    }
}
