// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate
{
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using System.Threading;
    using System.Threading.Tasks;

    internal class FabricBackendExtension : IHostedService
    {
        private readonly ILogger logger;

        public FabricBackendExtension(ILogger<FabricBackendExtension> logger)
        {
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Starting...");

            //// custom Fabric extension code goes here...

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Stopping...");
            return Task.CompletedTask;
        }
    }
}
