// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Controllers;
using NUnit.Framework;
using System.Net;

namespace Boilerplate.Tests
{

    [TestFixture]
    public class OneLakeControllerTests : ControllerTestsBase<OneLakeController>
    {
        [Test]
        public async Task IsOneLakeSupported_Success()
        {
            await TestIsOneLakeSupported(new[] { "OneLakeFolder" }, expectedStatusCode: HttpStatusCode.OK);
        }

        [Test]
        public async Task IsOneLakeSupported_Success_NoOneLakeFolders()
        {
            await TestIsOneLakeSupported(new string[0], expectedStatusCode: HttpStatusCode.OK);
        }

        private async Task TestIsOneLakeSupported(string[] oneLakeFolders, HttpStatusCode expectedStatusCode)
        {
            // -----------------------------------------------------------------
            // Arrange

            var workspaceId = Guid.NewGuid();
            var itemId = Guid.NewGuid();
            var url = $"/{workspaceId}/{itemId}/isOneLakeSupported";

            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.Item1ReadWriteAll });
            SetupGetAccessTokenOnBehalfOfCall(exp_scopes: OneLakeConstants.OneLakeScopes);
            SetupGetOneLakeFolderNames(exp_workspaceID: workspaceId, exp_itemId: itemId, ret_content: oneLakeFolders);

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.GetAsync(url);

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(expectedStatusCode));

            var oneLakeSupported = await response.Content.ReadAsAsync<bool>();
            Assert.That(oneLakeSupported, Is.EqualTo(oneLakeFolders.Any()));

            VerifyMocks();
        }
    }
}
