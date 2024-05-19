// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Controllers;
using NUnit.Framework;
using System.Net;

namespace Boilerplate.Tests
{
    [TestFixture]
    public class LakehouseControllerTests : ControllerTestsBase<LakehouseController>
    {
        [Test]
        public async Task GetLakehouseFile_Success()
        {
            await TestGetLakehouseFile(fileContent: "file-content", expectedStatusCode: HttpStatusCode.OK);
        }

        [Test]
        public async Task GetLakehouseFile_EmptyData()
        {
            await TestGetLakehouseFile(fileContent: string.Empty, expectedStatusCode: HttpStatusCode.NoContent);
        }

        private async Task TestGetLakehouseFile(string fileContent, HttpStatusCode expectedStatusCode)
        {
            // -----------------------------------------------------------------
            // Arrange

            var source = "source1";
            var url = $"/getLakehouseFile?source={source}";

            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.FabricLakehouseReadAll, WorkloadScopes.FabricLakehouseReadWriteAll });
            SetupGetAccessTokenOnBehalfOfCall(exp_scopes: OneLakeScopes);

            SetupGetLakehouseFileCall(exp_source: source, ret_content: fileContent);

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.GetAsync(url);

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(expectedStatusCode));

            var content = await response.Content.ReadAsStringAsync();
            Assert.That(content, Is.EqualTo(fileContent));

            VerifyMocks();
        }

        [Test]
        public async Task WriteToLakehouseFile_Success()
        {
            await TestWriteToLakehouseFile(fileExists: false, overwriteIfExists: false, expectedStatusCode: HttpStatusCode.OK);
            await TestWriteToLakehouseFile(fileExists: false, overwriteIfExists: true, expectedStatusCode: HttpStatusCode.OK);
            await TestWriteToLakehouseFile(fileExists: true, overwriteIfExists: true, expectedStatusCode: HttpStatusCode.OK);
        }

        [Test]
        public async Task WriteToLakehouseFile_Conflict()
        {
            await TestWriteToLakehouseFile(fileExists: true, overwriteIfExists: false, expectedStatusCode: HttpStatusCode.Conflict);
        }

        private async Task TestWriteToLakehouseFile(bool fileExists, bool overwriteIfExists, HttpStatusCode expectedStatusCode, bool sendNull = false)
        {
            // -----------------------------------------------------------------
            // Arrange

            var request = new WriteToLakehouseFileRequest
            {
                WorkspaceId = "workspace-id",
                LakehouseId = "lakehouse-id",
                FileName = "file-name",
                Content = "content",
                OverwriteIfExists = overwriteIfExists,
            };

            var expectedFilePath = $"{request.WorkspaceId}/{request.LakehouseId}/Files/{request.FileName}";

            SetupAuthenticateDataPlaneCall(new[] { WorkloadScopes.FabricLakehouseReadWriteAll });
            SetupGetAccessTokenOnBehalfOfCall(exp_scopes: OneLakeScopes);

            SetupCheckIfFileExistsCall(exp_path: expectedFilePath, ret_exists: fileExists);

            if (!fileExists || overwriteIfExists)
            {
                SetupWriteLakehouseFileCall(exp_path: expectedFilePath, exp_content: request.Content);
            }

            // -----------------------------------------------------------------
            // Act
            var client = CreateClient();
            var response = await client.PutAsJsonAsync("writeToLakehouseFile", sendNull ? null : request);

            // -----------------------------------------------------------------
            // Assert

            Assert.That(response.StatusCode, Is.EqualTo(expectedStatusCode));

            VerifyMocks();
        }
    }
}
