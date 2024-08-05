// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Controllers;
using Fabric_Extension_BE_Boilerplate.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Threading.Tasks;

namespace Boilerplate
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            using IHost host = Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostBuilderContext, services) =>
                {
                    if (!hostBuilderContext.HostingEnvironment.IsEnvironment("IntegrationTesting"))
                    {
                        services.AddCors(options =>
                        {
                            options.AddPolicy("devCorsPolicy",
                                policy =>
                                {
                                    policy.WithOrigins(new string[] { "*" });
                                    policy.AllowAnyHeader();
                                    policy.AllowAnyMethod();
                                });
                        });

                        // Configuration

                        var configurationService = new ConfigurationService();
                        var configuration = configurationService.GetConfiguration();
                        services.AddSingleton<IConfigurationService>(configurationService);

                        // Access to ASP.NET Core HttpContext
                        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

                        // HTTP requests logging
                        services.AddScoped<RequestLoggingFilter>();

                        // Microsoft Entra (Azure Active Directory) tokens validation and generation, authentication, authorization
                        AddOpenIdConnectConfigurationManager(services);
                        AddMsalConfidentialClientApplication(services, configuration);
                        services.AddSingleton<IAuthenticationService, AuthenticationService>();
                        services.AddSingleton<IAuthorizationHandler, AuthorizationHandler>();

                        // Items and metadata store
                        services.AddSingleton<IItemFactory, ItemFactory>();
                        services.AddSingleton<IItemMetadataStore, ItemMetadataStore>();

                        // Implementation of Fabric Workload REST API
                        services.AddSingleton<IItemLifecycleController, ItemLifecycleControllerImpl>();
                        services.AddSingleton<IJobsController, JobsControllerImpl>();
                        services.AddSingleton<IEndpointResolutionController, EndpointResolutionControllerImpl>();

                        // Access to Fabric Lakehouse
                        services.AddSingleton<IHttpClientService, HttpClientService>();
                        services.AddSingleton<ILakehouseClientService, LakehouseClientService>();

                        //// add more dependencies as needed

                        services.AddHostedService<FabricBackendExtension>();
                    }
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .Build();

            await host.RunAsync();
        }

        private static void AddOpenIdConnectConfigurationManager(IServiceCollection services)
        {
            var metadataEndpoint = $"{EnvironmentConstants.AadInstanceUrl}/common/.well-known/openid-configuration";
            var configurationRetriever = new OpenIdConnectConfigurationRetriever();
            var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(metadataEndpoint, configurationRetriever);

            services.AddSingleton<IConfigurationManager<OpenIdConnectConfiguration>>(configurationManager);
        }

        private static void AddMsalConfidentialClientApplication(IServiceCollection services, IConfiguration configuration)
        {
            var clientId = configuration["ClientId"];
            var clientSecret = configuration["ClientSecret"];
            var authority = $"{EnvironmentConstants.AadInstanceUrl}/organizations";

            var app = ConfidentialClientApplicationBuilder
                .Create(clientId)
                .WithAuthority(authority)
                .WithClientSecret(clientSecret)
                .Build();

            services.AddSingleton(app);
        }
    }
}
