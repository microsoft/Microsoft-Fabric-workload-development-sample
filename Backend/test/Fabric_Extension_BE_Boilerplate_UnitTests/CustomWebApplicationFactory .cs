// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Items;
using Boilerplate.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Moq;

namespace Boilerplate.Tests
{
    public class CustomWebApplicationFactory<TLoggerMockCategory> : WebApplicationFactory<Startup>
    {
        private Mock<ILogger<TLoggerMockCategory>>? _loggerMock;
        private Mock<IHttpContextAccessor>? _httpContextAccessorMock;
        private Mock<IAuthenticationService>? _authenticationServiceMock;
        private Mock<IAuthorizationHandler>? _authorizationHandlerMock;
        private Mock<ILakehouseClientService>? _lakeHouseClientServiceMock;
        private Mock<IOneLakeClientService>? _oneLakeClientServiceMock;
        private Mock<IItemFactory>? _itemFactoryMock;
        private Mock<IItemMetadataStore>? _itemMetadataStoreMock;
        private Mock<IItem1>? _item1Mock;

        public CustomWebApplicationFactory(
            Mock<ILogger<TLoggerMockCategory>>? loggerMock = null,
            Mock<IHttpContextAccessor>? httpContextAccessorMock = null,
            Mock<IAuthenticationService>? authenticationServiceMock = null,
            Mock<IAuthorizationHandler>? authorizationHandlerMock = null,
            Mock<IOneLakeClientService>? oneLakeClientServiceMock = null,
            Mock<ILakehouseClientService>? lakehouseClientServiceMock = null,
            Mock<IItemFactory>? itemFactoryMock = null,
            Mock<IItemMetadataStore>? itemMetadataStoreMock = null,
            Mock<IItem1>? item1Mock = null)
        {
            _loggerMock = loggerMock;
            _httpContextAccessorMock = httpContextAccessorMock;
            _authenticationServiceMock = authenticationServiceMock;
            _authorizationHandlerMock = authorizationHandlerMock;
            _oneLakeClientServiceMock = oneLakeClientServiceMock;
            _lakeHouseClientServiceMock = lakehouseClientServiceMock;
            _itemFactoryMock = itemFactoryMock;
            _itemMetadataStoreMock = itemMetadataStoreMock;
            _item1Mock = item1Mock;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("IntegrationTesting");
            base.ConfigureWebHost(builder);

            builder
                .ConfigureServices(services =>
                {
                    AddOrReplaceService(services, _loggerMock);
                    AddOrReplaceService(services, _httpContextAccessorMock);
                    AddOrReplaceService(services, _authenticationServiceMock);
                    AddOrReplaceService(services, _authorizationHandlerMock);
                    AddOrReplaceService(services, _lakeHouseClientServiceMock);
                    AddOrReplaceService(services, _oneLakeClientServiceMock);
                    AddOrReplaceService(services, _itemFactoryMock);
                    AddOrReplaceService(services, _itemMetadataStoreMock);
                    AddOrReplaceService(services, _item1Mock);
                });
        }

        private void AddOrReplaceService<TService>(IServiceCollection services, Mock<TService>? mock) where TService : class
        {
            if (mock != null)
            {
                var service = services.SingleOrDefault(d => d.ServiceType == typeof(TService));
                if (service != null)
                {
                    services.Remove(service);
                }

                services.AddSingleton<TService>(mock.Object);
            }
        }
    }
}
