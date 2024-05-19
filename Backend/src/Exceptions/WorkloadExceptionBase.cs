// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text.Json;

namespace Fabric_Extension_BE_Boilerplate.Exceptions
{
    public abstract class WorkloadExceptionBase : Exception
    {
        private static readonly IList<string> EmptyStringList = new string[0];

        private string _messageTemplate;
        private IList<string> _messageParameters;

        protected WorkloadExceptionBase(
            int httpStatusCode,
            string errorCode,
            string messageTemplate,
            IList<string> messageParameters,
            ErrorSource errorSource,
            bool isPermanent)
        {
            HttpStatusCode = httpStatusCode;
            ErrorCode = errorCode;
            ErrorSource = errorSource;
            IsPermanent = isPermanent;

            _messageTemplate = messageTemplate;
            _messageParameters = messageParameters ?? EmptyStringList;
        }

        public virtual int HttpStatusCode { get; }

        public virtual string ErrorCode { get; }

        public virtual string ErrorMessage => string.Format(_messageTemplate, _messageParameters.ToArray());

        public virtual ErrorSource ErrorSource { get; }

        public virtual bool IsPermanent { get; }

        public override string Message => ErrorMessage;

        public IList<ErrorExtendedInformation> Details { get; private set; }

        public virtual ContentResult ToHttpActionResult()
        {
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
        }

        public virtual string ToTelemetryString() => ErrorMessage;

        public WorkloadExceptionBase WithDetail(string errorCode, string messageTemplate, params (string name, string value)[] parameters )
        {
            var parameterValues = parameters.Select(p => p.value).ToArray();

            var detail = new ErrorExtendedInformation
            {
                ErrorCode = errorCode,
                Message = string.Format(messageTemplate, parameterValues),
                MessageParameters = parameterValues,
                AdditionalParameters = parameters.Select(p => new NameValuePair { Name = p.name, Value = p.value }).ToList(),
            };

            if (Details ==  null)
            {
                Details = new List<ErrorExtendedInformation>();
            }

            Details.Add(detail);

            return this;
        }
    }
}
