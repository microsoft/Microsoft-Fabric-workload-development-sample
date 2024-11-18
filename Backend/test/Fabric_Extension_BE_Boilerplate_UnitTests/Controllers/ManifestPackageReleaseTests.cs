using NUnit.Framework;
using System.Xml.Linq;

namespace Boilerplate.Tests
{
    [TestFixture]
    public class ManifestPackageReleaseTests
    {
        [Test]
        public void Parse_ValidNuspecFile_ReturnsCorrectFilesAndTargets()
        {
            string nuspecFilePath = @"..\..\..\..\..\src\Packages\manifest\ManifestPackageRelease.nuspec";
            var expectedFilesAndTargets = new Dictionary<string, string>
            {
                { @"WorkloadManifest.xml", @"BE\WorkloadManifest.xml" },
                { @"Item1.xml", @"BE\Item1.xml" },
                { @"..\..\..\..\Frontend\Package\*", @"FE" },
                { @"..\..\..\..\Frontend\Package\assets\**", @"FE\assets" }
            };

            var result = ParseNuspecFile(nuspecFilePath);

            Assert.That(result, Is.EquivalentTo(expectedFilesAndTargets));
        }

        private Dictionary<string, string> ParseNuspecFile(string filePath)
        {
            // Load the Nuspec file
            XDocument doc = XDocument.Load(filePath);

            // Extract files and their targets
            var filesAndTargets = doc.Root?
                .Element("{http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd}files")?
                .Elements("{http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd}file")
                .Where(e => e.Attribute("src") != null && e.Attribute("target") != null) // Filter out elements with null src attribute
                .ToDictionary(
                    e => e.Attribute("src")?.Value ?? string.Empty,
                    e => e.Attribute("target")?.Value ?? string.Empty);

            return filesAndTargets ?? new Dictionary<string, string>();
        }
    }
}