﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Controllers;
using Boilerplate.Exceptions;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using NUnit.Framework;
using System.Net;
using System.Security.Authentication;
using System.Text.Json;

namespace Boilerplate.Tests
{
    public class ExceptionFilterTests : ControllerTestsBase<FabricExtensionController>
    {
        private static readonly Func<string, bool> NonEmptyStringValidator = (string v) => !v.IsNullOrEmpty();

        [Test]
        public async Task AuthenticationUIRequiredExceptionThrown()
        {
            var message = "message";
            await TestExceptionFilter(
                new AuthenticationUIRequiredException(message),
                expectedStatusCode: HttpStatusCode.Unauthorized,
                expectedHeaders: new[] { ("WWW-Authenticate", NonEmptyStringValidator) },
                expectedBody: new ErrorResponse
                {
                    ErrorCode = ErrorCodes.Authentication.AuthUIRequired,
                    Message = message,
                    Source = ErrorSource.System,
                    IsPermanent = false,
                    MessageParameters = null
                });
        }

        [Test]
        public async Task AuthenticationExceptionThrown()
        {
            await TestExceptionFilter(
                new AuthenticationException(),
                expectedStatusCode: HttpStatusCode.Unauthorized);
        }

        [Test]
        public async Task UnauthorizedExceptionThrown()
        {
            await TestExceptionFilter(
                new UnauthorizedException(),
                expectedStatusCode: HttpStatusCode.Forbidden,
                expectedBody: new ErrorResponse
                {
                    ErrorCode = ErrorCodes.Security.AccessDenied,
                    Message = "Access denied",
                    Source = ErrorSource.User,
                    IsPermanent = true,
                });
        }

        [Test]
        public async Task InternalErrorExceptionThrown()
        {
            await TestExceptionFilter(
                new InvariantViolationException("2 * 2 != 4"),
                expectedStatusCode: HttpStatusCode.InternalServerError,
                expectedBody: new ErrorResponse
                {
                    ErrorCode = ErrorCodes.InternalError,
                    Message = "Internal error",
                    Source = ErrorSource.System,
                    IsPermanent = false,
                });
        }

        [Test]
        public async Task InvalidItemPayloadExceptionWithMultipleDetailsThrown()
        {
            var itemType = "Org.WorkloadSample.Item1";
            var itemId = "4922bafe-54d8-4baf-9a67-8d6d0db1d51b";

            await TestExceptionFilter(
                new InvalidItemPayloadException(itemType, new Guid(itemId))
                    .WithDetail("error1", "Error with 1 parameter: p1={0}", ("p1", "v1"))
                    .WithDetail("error2", "Error with 2 parameters: p1={0}, p2={1}", ("p1", "v1"), ("p2", "v2")),
                expectedStatusCode: HttpStatusCode.BadRequest,
                expectedBody: new ErrorResponse
                {
                    ErrorCode = ErrorCodes.ItemPayload.InvalidItemPayload,
                    Message = $"{itemType} payload is invalid for id={itemId}. See MoreDetails for additional information.",
                    MessageParameters = new[] { itemType, itemId },
                    Source = ErrorSource.User,
                    IsPermanent = true,
                    MoreDetails = new[]
                    {
                        new ErrorExtendedInformation
                        {
                            ErrorCode = "error1",
                            Message = "Error with 1 parameter: p1=v1",
                            MessageParameters = new[] { "v1" },
                            AdditionalParameters = new[] { new NameValuePair { Name = "p1", Value = "v1" } },
                        },
                        new ErrorExtendedInformation
                        {
                            ErrorCode = "error2",
                            Message = "Error with 2 parameters: p1=v1, p2=v2",
                            MessageParameters = new[] { "v1", "v2" },
                            AdditionalParameters = new[] { new NameValuePair { Name = "p1", Value = "v1" }, new NameValuePair { Name = "p2", Value = "v2" } },
                        }
                    }
                });
        }

        private async Task TestExceptionFilter<TException>(
            TException exception,
            HttpStatusCode expectedStatusCode,
            IList<(string name, Func<string, bool> validator)>? expectedHeaders = null,
            ErrorResponse? expectedBody = null) where TException : Exception
        {
            // -----------------------------------------------------------------
            // Arrange

            // For this test it doesn't matter where the exception is thrown from and which controller/method we check.
            // So we pick the simplest method and mock the first method being called to throw.
            SetupAuthenticateDataPlaneCall(err_exception: exception);

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.GetAsync("/item1SupportedOperators");

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(expectedStatusCode));

            if (expectedHeaders != null)
            {
                foreach (var header in expectedHeaders)
                {
                    Assert.That(response.Headers.Contains(header.name), Is.True);
                    
                    var values = response.Headers.GetValues(header.name);
                    Assert.That(values, Has.Exactly(1).Items);
                    Assert.That(header.validator(values.Single()), Is.True);
                }
            }

            if (expectedBody != null)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                Assert.That(errorResponse, Is.EqualTo(JsonSerializer.Serialize(expectedBody)));
            }

            VerifyMocks();
        }
    }
}