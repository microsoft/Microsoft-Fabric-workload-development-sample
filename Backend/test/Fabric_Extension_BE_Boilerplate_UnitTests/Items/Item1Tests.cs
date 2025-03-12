// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>


using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Items;
using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Moq;
using NUnit.Framework;
using System.Text.Json;

namespace Boilerplate.Tests
{
    [TestFixture]
    public class Item1Tests
    {
        private async Task<Item1> CreateAndSetupItemForTest(Guid workspaceIdGuid, Guid itemIdGuid, int operand1, int operand2, Mock<IItemMetadataStore>? itemMetadataStoreMock = null)
        {
            // Arrange
            var originalMetaData = new Item1Metadata
            {
                Lakehouse = new ItemReference(),
                Operand1 = operand1,
                Operand2 = operand2
            };

            // Mock setup
            itemMetadataStoreMock ??= new Mock<IItemMetadataStore>(MockBehavior.Strict);
            var iloggerMock = new Mock<ILogger<Item1>>();
            var ilakehouseClientServiceMock = new Mock<ILakehouseClientService>(MockBehavior.Strict);
            var ionelakeClientServiceMock = new Mock<IOneLakeClientService>(MockBehavior.Strict);
            var iauthenticationServiceMock = new Mock<IAuthenticationService>(MockBehavior.Strict);
            var authorizationContextMock = new Mock<AuthorizationContext>(MockBehavior.Strict);
            var item1Instance = new Item1(iloggerMock.Object, itemMetadataStoreMock.Object, ilakehouseClientServiceMock.Object, ionelakeClientServiceMock.Object, iauthenticationServiceMock.Object, authorizationContextMock.Object);
            var createItemReq = new CreateItemRequest
            {
                CreationPayload = new CreateItemPayload
                {
                    Item1Metadata = originalMetaData
                }
            }; 
            itemMetadataStoreMock.Setup(m => m.Upsert(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CommonItemMetadata>(), It.IsAny<Item1Metadata>()))
                .Callback<Guid, Guid, CommonItemMetadata, Item1Metadata>((tenantObjectIdParam, itemObjectIdGuidParam, commonItemMetadataParam, item1MetadataParam) =>
                {
                    Assert.That(itemObjectIdGuidParam, Is.EqualTo(itemIdGuid));
                    Assert.That(item1MetadataParam.Operand1, Is.EqualTo(item1Instance.Operand1));
                    Assert.That(item1MetadataParam.Operand2, Is.EqualTo(item1Instance.Operand2));
                })
                .Returns(Task.CompletedTask)
                .Verifiable();

            iauthenticationServiceMock.Setup(m => m.GetAccessTokenOnBehalfOf(authorizationContextMock.Object, OneLakeConstants.OneLakeScopes))
                .ReturnsAsync("myOneLakeToken")
                .Verifiable();

            var metadataFilePathInOneLake = $"{workspaceIdGuid}/{itemIdGuid}/Files/metadata.json";
            ionelakeClientServiceMock.Setup(m => m.CheckIfFileExists(It.IsAny<string>(), It.IsAny<string>()))
                .Callback<string, string>((tokenParam, pathParam) =>
                {
                    Assert.That(tokenParam, Is.EqualTo("myOneLakeToken"));
                    Assert.That(pathParam, Is.EqualTo(metadataFilePathInOneLake));
                }).ReturnsAsync(false)
                .Verifiable();

            ionelakeClientServiceMock.Setup(m => m.WriteToOneLakeFile(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Callback<string, string, string>((tokenParam, pathParam, contentParam) =>
                {
                    Assert.That(tokenParam, Is.EqualTo("myOneLakeToken"));
                    Assert.That(pathParam, Is.EqualTo(metadataFilePathInOneLake));
                    Assert.That(contentParam, Is.EqualTo(JsonSerializer.Serialize(item1Instance.Metadata)));
                }).Returns(Task.CompletedTask)
                .Verifiable();

            await item1Instance.Create(workspaceIdGuid, itemIdGuid, createItemReq);
            return item1Instance;
        }

        [TestCase(10, 20, 20, 40)]
        [TestCase(0, 0, 0, 0)]
        [TestCase(0, -1, 0, -2)]
        [TestCase(-5, 10, -10, 20)]
        public async Task ItemDoubleTestSuccess(int operand1, int operand2, int operand1Expected, int operand2Expected)
        {
            var itemMetadataStoreMock = new Mock<IItemMetadataStore>();
            var workspaceIdGuid = Guid.NewGuid();
            var itemIdGuid = Guid.NewGuid();
            var item1Instance = await CreateAndSetupItemForTest(workspaceIdGuid, itemIdGuid, operand1, operand2, itemMetadataStoreMock);

            // Act
            var doubleResult = await item1Instance.Double();

            // Assert
            Assert.That(doubleResult.Operand1, Is.EqualTo(operand1Expected));
            Assert.That(doubleResult.Operand2, Is.EqualTo(operand2Expected));   
            itemMetadataStoreMock.Verify(x => x.Upsert(It.IsAny<Guid>(), itemIdGuid, It.IsAny<CommonItemMetadata>(), It.IsAny<Item1Metadata>()), Times.Exactly(2));
        }

        [TestCase(int.MaxValue, 20, "Operand1 may lead to overflow")]
        [TestCase(-50, int.MinValue, "Operand2 may lead to overflow")]
        [TestCase(int.MinValue, int.MaxValue, "Operand1, Operand2 may lead to overflow")]
        public async Task ItemDoubleOverflowTest(int operand1, int operand2, string errorMessageExpected)
        {
            var workspaceIdGuid = Guid.NewGuid();
            var itemIdGuid = Guid.NewGuid();
            var item1Instance = await CreateAndSetupItemForTest(workspaceIdGuid, itemIdGuid, operand1, operand2);

            // Act
            var exception = Assert.ThrowsAsync<DoubledOperandsOverflowException>(async () => await item1Instance.Double());

            // Assert
            Assert.That(exception.ErrorCode, Is.EqualTo(ErrorCodes.Item.DoubledOperandsOverflow));
            Assert.That(exception.Message, Is.EqualTo(errorMessageExpected));
        }
    }
}