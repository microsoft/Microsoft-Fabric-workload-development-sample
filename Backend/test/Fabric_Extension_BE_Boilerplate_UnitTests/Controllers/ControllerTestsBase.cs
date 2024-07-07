// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Boilerplate.Controllers;
using Boilerplate.Exceptions;
using Boilerplate.Items;
using Boilerplate.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Moq;
using NUnit.Framework;
using System.Net.Http.Headers;
using System.Security.Claims;

namespace Boilerplate.Tests
{
    public abstract class ControllerTestsBase<TLoggerMockCategory>
    {
        private WebApplicationFactory<Startup> _webApplicationFactory;

        protected const string IncomingToken = "incoming-token";
        protected const string FabricCompositeToken = "fabric-composite-token";
        protected const string OneLakeToken = "onelake-token";
        protected static readonly Guid TenantObjectId = Guid.NewGuid();

        protected static readonly IList<Claim> IncomingClaims = new[]
        {
            new Claim("c1", "v1"),
            new Claim("tid", TenantObjectId.ToString())
        };

        protected static readonly AuthorizationContext IncomingAuthorizationContext = new AuthorizationContext() { OriginalSubjectToken = IncomingToken, Claims = IncomingClaims };

        protected static readonly IList<string> FabricScopes = new[] { "https://analysis.windows.net/powerbi/api/.default" };
        protected static readonly IList<string> OneLakeScopes = new[] { "https://storage.azure.com/.default" };

        protected Mock<ILogger<TLoggerMockCategory>> LoggerMock { get; private set; }

        protected Mock<IHttpContextAccessor> HttpContextAccessorMock { get; private set; }

        protected Mock<IAuthenticationService> AuthenticationServiceMock { get; private set; }

        protected Mock<IAuthorizationHandler> AuthorizationHandlerMock { get; private set; }

        protected Mock<ILakehouseClientService> LakeHouseClientServiceMock { get; private set; }

        protected Mock<IItemFactory> ItemFactoryMock { get; private set; }

        protected Mock<IItemMetadataStore> ItemMetadataStoreMock { get; private set; }

        protected Mock<IItem1> Item1Mock { get; private set; }

        protected HttpContext? HttpContext { get; private set; }

        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            LoggerMock = new Mock<ILogger<TLoggerMockCategory>>();
            HttpContextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
            AuthenticationServiceMock = new Mock<IAuthenticationService>(MockBehavior.Strict);
            AuthorizationHandlerMock = new Mock<IAuthorizationHandler>(MockBehavior.Strict);
            LakeHouseClientServiceMock = new Mock<ILakehouseClientService>();
            ItemFactoryMock = new Mock<IItemFactory>();
            ItemMetadataStoreMock = new Mock<IItemMetadataStore>();
            Item1Mock = new Mock<IItem1>();

            _webApplicationFactory = new CustomWebApplicationFactory<TLoggerMockCategory>(
                LoggerMock,
                HttpContextAccessorMock,
                AuthenticationServiceMock,
                AuthorizationHandlerMock,
                LakeHouseClientServiceMock,
                ItemFactoryMock,
                ItemMetadataStoreMock,
                Item1Mock);
        }

        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            if (_webApplicationFactory != null)
            {
                _webApplicationFactory.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            ResetMocks();
        }

        protected HttpClient CreateClient(bool withAuthorizationHeader = true)
        {
            var client = _webApplicationFactory.CreateClient();

            if (withAuthorizationHeader)
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", IncomingToken);
            }

            return client;
        }

        protected void VerifyMocks()
        {
            LoggerMock.Verify();
            HttpContextAccessorMock.Verify();
            AuthenticationServiceMock.Verify();
            AuthorizationHandlerMock.Verify();
            ItemFactoryMock.Verify();
        }

        protected void ResetMocks()
        {
            LoggerMock.Reset();
            HttpContextAccessorMock.Reset();
            AuthenticationServiceMock.Reset();
            AuthorizationHandlerMock.Reset();
            ItemFactoryMock.Reset();

            HttpContextAccessorMock
                .SetupSet(m => m.HttpContext = It.IsAny<HttpContext>())
                .Callback((HttpContext _httpContext) => HttpContext = _httpContext);

            HttpContextAccessorMock
                .SetupGet(m => m.HttpContext)
                .Returns(() => HttpContext);
        }

        protected void SetupAuthenticateDataPlaneCall(IList<string>? exp_allowedScopes = null, Exception? err_exception = null)
        {
            var setupWithCallback = AuthenticationServiceMock
                .Setup(m => m.AuthenticateDataPlaneCall(It.IsAny<HttpContext>(), It.IsAny<IList<string>>()))
                .Callback((HttpContext _httpContext, IList<string> _allowedScopes) =>
                {
                    if (exp_allowedScopes != null)
                    {
                        Assert.That(_httpContext, Is.EqualTo(HttpContext));
                        Assert.That(_allowedScopes, Is.EquivalentTo(exp_allowedScopes));
                    }
                });

            if (err_exception == null)
            {
                setupWithCallback
                    .ReturnsAsync(IncomingAuthorizationContext)
                    .Verifiable();
            }
            else
            {
                setupWithCallback
                    .Throws(err_exception)
                    .Verifiable();
            }
        }

        protected void SetupAuthenticateControlPlaneCall(bool expectedRequireSubjectToken, bool expectedRequireTenantIdHeader, Exception? err_exception = null)
        {
            var setupWithCallback = AuthenticationServiceMock
                .Setup(m => m.AuthenticateControlPlaneCall(It.IsAny<HttpContext>(), It.IsAny<bool>(), It.IsAny<bool>()))
                .Callback((HttpContext _httpContext, bool _requireSubjectToken, bool _requireTenantIdHeader) =>
                {
                    Assert.That(_httpContext, Is.EqualTo(HttpContext));
                    Assert.That(_requireSubjectToken, Is.EqualTo(expectedRequireSubjectToken), "The requireSubjectToken argument does not match the expected value.");
                    Assert.That(_requireTenantIdHeader, Is.EqualTo(expectedRequireTenantIdHeader), "The requireTenantIdHeader argument does not match the expected value.");
                });

            if (err_exception == null)
            {
                setupWithCallback
                    .ReturnsAsync(IncomingAuthorizationContext)
                    .Verifiable();
            }
            else
            {
                setupWithCallback
                    .Throws(err_exception)
                    .Verifiable();
            }
        }

        protected void SetupHttpContextAccessorMock(HttpContext context)
        {
            HttpContextAccessorMock.SetupGet(m => m.HttpContext).Returns(context);
            HttpContext = context;
        }

        protected void SetupValidatePermissionsCall(bool isAuthorized, Guid expectedWorkspaceId, Guid expectedItemId, IList<string> expectedPermissions)
        {
            AuthorizationHandlerMock
                .Setup(m => m.ValidatePermissions(It.IsAny<AuthorizationContext>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<IList<string>>()))
                .Callback((AuthorizationContext context, Guid workspaceId, Guid itemId, IList<string> requiredPermissions) =>
                {
                    Assert.That(workspaceId, Is.EqualTo(expectedWorkspaceId));
                    Assert.That(itemId, Is.EqualTo(expectedItemId));
                    Assert.That(requiredPermissions, Is.EqualTo(expectedPermissions));

                    Assert.NotNull(context);
                })
                .Returns((AuthorizationContext context, Guid workspaceId, Guid itemId, IList<string> requiredPermissions) =>
                {
                    // Return the appropriate Task result based on the isAuthorized flag
                    return isAuthorized ? Task.CompletedTask : Task.FromException(new UnauthorizedException());
                })
                .Verifiable();
        }

        protected void SetupBuildCompositeTokenCall(IList<string> exp_allowedScopes)
        {
            AuthenticationServiceMock
                .Setup(m => m.BuildCompositeToken(It.IsAny<AuthorizationContext>(), It.IsAny<IList<string>>()))
                .Callback((AuthorizationContext _authorizationContext, IList<string> _scopes) =>
                {
                    Assert.That(_authorizationContext, Is.EqualTo(IncomingAuthorizationContext));
                    Assert.That(_scopes, Is.EquivalentTo(FabricScopes));
                })
                .ReturnsAsync(FabricCompositeToken)
                .Verifiable();
        }

        protected void SetupGetAccessTokenOnBehalfOfCall(IList<string> exp_scopes)
        {
            AuthenticationServiceMock
                .Setup(m => m.GetAccessTokenOnBehalfOf(It.IsAny<AuthorizationContext>(), It.IsAny<IList<string>>()))
                .Callback((AuthorizationContext _authorizationContext, IList<string> _scopes) =>
                {
                    Assert.That(_authorizationContext, Is.EqualTo(IncomingAuthorizationContext));
                    Assert.That(_scopes, Is.EquivalentTo(exp_scopes));
                })
                .ReturnsAsync(OneLakeToken)
                .Verifiable();
        }

        protected void SetupGetLakehouseFileCall(string exp_source, string ret_content)
        {
            LakeHouseClientServiceMock
                .Setup(m => m.GetLakehouseFile(It.IsAny<string>(), It.IsAny<string>()))
                .Callback((string _token, string _source) =>
                {
                    Assert.That(_token, Is.EqualTo(OneLakeToken));
                    Assert.That(_source, Is.EqualTo(exp_source));
                })
                .ReturnsAsync(ret_content)
                .Verifiable();
        }

        protected void SetupCreateItemCall(Guid expectedItemId, string expectedItemType)
        {
            Item1Mock
                .Setup(item => item.Load(It.IsAny<Guid>()))
                .Callback((Guid itemId) =>
                {
                    Assert.That(itemId, Is.EqualTo(expectedItemId));
                })
                .Returns(Task.CompletedTask)
                .Verifiable();

            Item1Mock
                .Setup(item => item.Double())
                .ReturnsAsync((0.0, 0.0))
                .Verifiable();

            ItemFactoryMock
                .Setup(m => m.CreateItem(It.IsAny<string>(), It.IsAny<AuthorizationContext>()))
                .Callback((string itemType, AuthorizationContext authorizationContext) =>
                {
                    Assert.That(itemType, Is.EqualTo(expectedItemType));
                    Assert.That(authorizationContext, Is.EqualTo(IncomingAuthorizationContext));
                })
                .Returns(Item1Mock.Object)
                .Verifiable();
        }

        protected void SetupWriteLakehouseFileCall(string exp_path, string exp_content)
        {
            LakeHouseClientServiceMock
                .Setup(m => m.WriteToLakehouseFile(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Callback((string _token, string _path, string _content) =>
                {
                    Assert.That(_token, Is.EqualTo(OneLakeToken));
                    Assert.That(_path, Is.EqualTo(exp_path));
                    Assert.That(_content, Is.EqualTo(exp_content));
                })
                .Returns(Task.CompletedTask)
                .Verifiable();
        }

        protected void SetupCheckIfFileExistsCall(string exp_path, bool ret_exists)
        {
            LakeHouseClientServiceMock
                .Setup(m => m.CheckIfFileExists(It.IsAny<string>(), It.IsAny<string>()))
                .Callback((string _token, string _path) =>
                {
                    Assert.That(_token, Is.EqualTo(OneLakeToken));
                    Assert.That(_path, Is.EqualTo(exp_path));
                })
                .ReturnsAsync(ret_exists)
                .Verifiable();
        }
    }
}
