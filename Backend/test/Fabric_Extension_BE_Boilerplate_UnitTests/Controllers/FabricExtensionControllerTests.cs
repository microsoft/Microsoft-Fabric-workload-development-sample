// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Controllers;
using Fabric_Extension_BE_Boilerplate.Constants;
using NUnit.Framework;
using System.Net;

namespace Boilerplate.Tests
{
    [TestFixture]
    public class FabricExtensionControllerTests : ControllerTestsBase<FabricExtensionController>
    {
        [Test]
        public async Task GetSupportedOperators_Success()
        {
            // -----------------------------------------------------------------
            // Arrange

            // Mock the authentication service
            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.Item1ReadWriteAll });

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.GetAsync("/item1SupportedOperators");

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

            var operators = await response.Content.ReadAsAsync<IList<string>>();
            Assert.That(operators, Is.EquivalentTo(Enum.GetNames<Item1Operator>()));

            VerifyMocks();
        }

        [Test]
        public async Task Item1DoubleResult_Success()
        {
            // -----------------------------------------------------------------
            // Arrange

            // Mock the authentication service
            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.Item1ReadWriteAll });

            // Mock Guid values for the URL parameters
            var workspaceObjectId = Guid.NewGuid();
            var itemObjectId = Guid.NewGuid();

            // Mock the authorization handler
            SetupValidatePermissionsCall(isAuthorized: true, workspaceObjectId, itemObjectId, new[] { "Read", "Write" });

            SetupCreateItemCall(itemObjectId, WorkloadConstants.ItemTypes.Item1);

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.PostAsync($"/{workspaceObjectId}/{itemObjectId}/item1DoubleResult", null);

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

            VerifyMocks();
        }

        [Test]
        public async Task Item1DoubleResult_Unauthorized()
        {
            // -----------------------------------------------------------------
            // Arrange
            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.Item1ReadWriteAll });

            var workspaceObjectId = Guid.NewGuid();
            var itemObjectId = Guid.NewGuid();

            SetupValidatePermissionsCall(isAuthorized: false, workspaceObjectId, itemObjectId, new[] { "Read", "Write" });

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var result = await client.PostAsync($"/{workspaceObjectId}/{itemObjectId}/item1DoubleResult", null);

            // -----------------------------------------------------------------
            // Assert
            Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.Forbidden));

            VerifyMocks();
        }
    }
}
