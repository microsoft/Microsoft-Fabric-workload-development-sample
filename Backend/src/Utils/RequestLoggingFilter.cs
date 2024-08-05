// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fabric_Extension_BE_Boilerplate.Utils
{
    public class RequestLoggingFilter : IAsyncActionFilter
    {
        private readonly ILogger<RequestLoggingFilter> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RequestLoggingFilter(ILogger<RequestLoggingFilter> logger, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var actionName = context.ActionDescriptor.DisplayName;
            var arguments = context.ActionArguments;

            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
            var serializedArguments = JsonConvert.SerializeObject(arguments, Formatting.None);
            var headers = GetHeaders(_httpContextAccessor.HttpContext);
            var serializedHeaders = JsonConvert.SerializeObject(headers, Formatting.None);

            _logger.LogInformation("[{Timestamp}] {ActionName} - Args: {Arguments}, Headers: {Headers}",
                                   timestamp, actionName, serializedArguments, serializedHeaders);

            await next();
        }

        private static IDictionary<string, string> GetHeaders(HttpContext httpContext)
        {
            var headersToLog = new Dictionary<string, string>();
            var headerKeys = new List<string>
            {
                HttpHeaders.RequestId,
                HttpHeaders.ActivityId,
                HttpHeaders.XmsClientTenantId,
            };

            foreach (var key in headerKeys)
            {
                if (httpContext.Request.Headers.TryGetValue(key, out var headerValue))
                {
                    headersToLog[key] = headerValue;
                }
            }

            return headersToLog;
        }
    }
}