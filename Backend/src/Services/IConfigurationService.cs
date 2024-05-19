// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.Extensions.Configuration;

namespace Boilerplate.Services
{
    /// <summary>
    /// Interface for providing configuration settings.
    /// </summary>
    public interface IConfigurationService
    {
        /// <summary>
        /// Gets the configuration settings from the appsettings.json file.
        /// </summary>
        /// <returns>The <see cref="IConfiguration"/> object representing the configuration settings.</returns>
        IConfiguration GetConfiguration();
    }
}
