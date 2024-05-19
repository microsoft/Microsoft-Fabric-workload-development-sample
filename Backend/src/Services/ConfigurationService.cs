// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.Extensions.Configuration;
using System.IO;

namespace Boilerplate.Services
{
    /// <summary>
    /// Implementation of the <see cref="IConfigurationService"/> interface for providing configuration settings.
    /// </summary>
    public class ConfigurationService : IConfigurationService
    {
        /// <summary>
        /// Gets the configuration settings from the appsettings.json file.
        /// </summary>
        /// <returns>The <see cref="IConfiguration"/> object representing the configuration settings.</returns>
        public IConfiguration GetConfiguration()
        {
            return new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();
        }
    }
}
