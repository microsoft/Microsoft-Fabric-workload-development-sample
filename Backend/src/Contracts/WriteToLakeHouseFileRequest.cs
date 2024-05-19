// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Represents a request to write content to a file in a lakehouse.
    /// </summary>
    public class WriteToLakehouseFileRequest
    {
        /// <summary>
        /// Gets or sets the unique identifier of the workspace where the file will be written.
        /// </summary>
        public string WorkspaceId { get; set; }

        /// <summary>
        /// Gets or sets the unique identifier of the lakehouse where the file will be stored.
        /// </summary>
        public string LakehouseId { get; set; }

        /// <summary>
        /// Gets or sets the name of the file to be written.
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Gets or sets the content to be written to the file.
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Gets or sets a flag indicating whether to overwrite the file if it already exists.
        /// </summary>
        public bool OverwriteIfExists { get; set; }
    }
}
