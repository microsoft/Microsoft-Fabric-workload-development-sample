// <copyright file="FabricBackendExtension.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Text.RegularExpressions;
using System.Xml.Linq;

class WorkloadManifestValidator
{
    private const int ExtensionNameMaxLength = 32;
    private const int ArtifactTypeMaxLength = 64;
    private const string ExtensionNameRegex = "^([a-zA-Z0-9-]+)\\.([a-zA-Z0-9-]+)$";
    private const string ArtifactTypeRegex = "^([a-zA-Z0-9-]+)\\.([a-zA-Z0-9-]+)\\.([a-zA-Z0-9-]+)$";
    private const string validationErrorsFile = "ValidationErrors.txt";

    public static void Main(string[] args)
    {   
        if (args.Length < 2 )
        {
            throw new Exception("Invalid Input");
        }

        XDocument xdoc = XDocument.Load(args[0]);
        string outputFile = args[1] + validationErrorsFile;
        File.Delete(outputFile);
        string errors = string.Empty;

        string? workloadId = xdoc?.Descendants("Workload")?.FirstOrDefault()?.Attribute("WorkloadId")?.Value;
        if (string.IsNullOrEmpty(workloadId))
        {
            errors += "Error: WorkloadId cannot be null or empty\n";
        }
        else
        {
            if (workloadId.Length > ExtensionNameMaxLength)
            {
                errors += "Error: WorkloadId is too long\n";
            }

            if (!Regex.IsMatch(workloadId, ExtensionNameRegex))
            {
                errors += "Error: WorkloadId contains invalid characters\n";
            }
        }

        string? version = xdoc?.Descendants("Version")?.FirstOrDefault()?.Value;
        if (string.IsNullOrEmpty(version))
        {
            errors += "Error: Version cannot be null or empty\n";
        }

        IEnumerable<XElement>? artifactDefs = xdoc?.Descendants("ArtifactDefinition");
        if (artifactDefs == null || artifactDefs.Count() == 0)
        {
            errors += "Error: No artifact definitions in the file\n";
        }
        else
        {
            if (artifactDefs.Any(ad => string.IsNullOrEmpty(ad?.Attribute("TypeName")?.Value)))
            {
                errors += "Error: One or more artifacts typeNames are missing or empty\n";
            }

            if (artifactDefs.Any(ad => ad?.Attribute("TypeName")?.Value.Length > ArtifactTypeMaxLength))
            {
                errors += "Error: One or more artifacts typeNames are too long\n";
            }

            if (artifactDefs.Any(ad => !Regex.IsMatch(ad?.Attribute("TypeName")?.Value, ArtifactTypeRegex)))
            {
                errors += "Error: One or more artifacts typeNames have invalid characters\n";
            }
        }

        if (errors.Length > 0)
        {
            File.WriteAllText(outputFile, errors);
        }
    }
}