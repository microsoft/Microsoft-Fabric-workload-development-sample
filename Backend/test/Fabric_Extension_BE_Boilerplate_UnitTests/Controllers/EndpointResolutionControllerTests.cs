// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Controllers;
using Moq;
using NUnit.Framework;

namespace Boilerplate.Tests
{
    public class EndpointResolutionControllerTests : ControllerTestsBase<EndpointResolutionController>
    {
        [Test]
        public async Task ResolveAsync_Success()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<EndpointResolutionControllerImpl>>();

            var context = new DefaultHttpContext();
            context.Request.Scheme = "https";
            context.Request.Host = new HostString("localhost", 5001);
            context.Request.PathBase = new PathString("/myapp");

            SetupAuthenticateControlPlaneCall(expectedRequireSubjectToken: false, expectedRequireTenantIdHeader: false);
            SetupHttpContextAccessorMock(context);

            var controllerImpl = new EndpointResolutionControllerImpl(
                HttpContextAccessorMock.Object,
                mockLogger.Object,
                AuthenticationServiceMock.Object
            );

            var request = new EndpointResolutionRequest
            {
                Context = new List<EndpointResolutionContextProperty>
                {
                    new EndpointResolutionContextProperty
                    {
                        Name = EndpointResolutionContextPropertyName.WorkspaceRegion,
                        Value = "West Central US"
                    },
                    new EndpointResolutionContextProperty
                    {
                        Name = EndpointResolutionContextPropertyName.TenantId,
                        Value = "4eaab2d1-9704-450f-8497-f3132be244ed"
                    }
                }
            };

            var expectedBaseUrl = "https://localhost:5001/myapp/workload";

            // Act
            var response = await controllerImpl.ResolveAsync(request);
            var result = response.Url;

            // Assert
            Assert.That(result, Is.EqualTo(expectedBaseUrl));

            VerifyMocks();
        }

        [Test]
        public void ResolveAsync_NullRequestBody()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<EndpointResolutionControllerImpl>>();

            var context = new DefaultHttpContext();
            SetupHttpContextAccessorMock(context);

            var controllerImpl = new EndpointResolutionControllerImpl(
                HttpContextAccessorMock.Object,
                mockLogger.Object,
                AuthenticationServiceMock.Object
            );

            // Act & Assert
            Assert.ThrowsAsync<ArgumentNullException>(async () => await controllerImpl.ResolveAsync(null));

            VerifyMocks();
        }

        [Test]
        public void ResolveAsync_EmptyContext()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<EndpointResolutionControllerImpl>>();

            var context = new DefaultHttpContext();
            SetupHttpContextAccessorMock(context);

            var controllerImpl = new EndpointResolutionControllerImpl(
                HttpContextAccessorMock.Object,
                mockLogger.Object,
                AuthenticationServiceMock.Object
            );

            var request = new EndpointResolutionRequest
            {
                Context = new List<EndpointResolutionContextProperty>() // Empty context
            };

            // Act & Assert
            Assert.ThrowsAsync<ArgumentException>(async () => await controllerImpl.ResolveAsync(request));

            VerifyMocks();
        }

        [Test]
        public void ResolveAsync_Unauthorized()
        {
            // Arrange
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockLogger = new Mock<ILogger<EndpointResolutionControllerImpl>>();

            SetupAuthenticateControlPlaneCall(expectedRequireSubjectToken: false, expectedRequireTenantIdHeader: false, err_exception: new UnauthorizedAccessException());

            var controllerImpl = new EndpointResolutionControllerImpl(
                HttpContextAccessorMock.Object,
                mockLogger.Object,
                AuthenticationServiceMock.Object
            );

            var request = new EndpointResolutionRequest
            {
                Context = new List<EndpointResolutionContextProperty>
                {
                    new EndpointResolutionContextProperty
                    {
                        Name = EndpointResolutionContextPropertyName.WorkspaceRegion,
                        Value = "West Central US"
                    },
                    new EndpointResolutionContextProperty
                    {
                        Name = EndpointResolutionContextPropertyName.TenantId,
                        Value = "4eaab2d1-9704-450f-8497-f3132be244ed"
                    }
                }
            };

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await controllerImpl.ResolveAsync(request));

            VerifyMocks();
        }
    }
}
