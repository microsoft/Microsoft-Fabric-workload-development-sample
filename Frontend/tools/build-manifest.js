const fs = require("fs").promises;
const { exec } = require("child_process");
const util = require("util");
const os = require("os");
const path = require("path");

const execAsync = util.promisify(exec);

const buildManifestPackageScript = path.resolve(__dirname, "../../scripts/Build/BuildManifestPackage.ps1"); // Ensure the path is resolved correctly

// Convert to CommonJS module format for compatibility
async function buildManifestPackage() {
  try
  {
    var buildManifestPackageCmd = "";
    const operatingSystem = os.platform();
    if (operatingSystem === 'win32') {
      buildManifestPackageCmd = buildManifestPackageScript;
    } else {
      buildManifestPackageCmd = `pwsh ${buildManifestPackageScript}`;
    }

    //run the PowerShell script to build the package manifest
    const { stdout, stderr } = await execAsync(`pwsh ${buildManifestPackageScript}`);
    if (stderr) {
        console.error(`⚠️ BuildManifestPackage error: ${stderr}`);
    } else  {
        console.log(`✅ BuildManifestPackage completed successfully.`);
        console.log(`📦BuildManifestPackage: ${stdout}`);
    }
  }
  catch (error) {
    console.error(`❌ Error building the Package Manifest: ${error.message}`);
  }
}

// Export the function for use in other modules
module.exports = {
  buildManifestPackage
};

// Still call it directly when this file is run directly
buildManifestPackage();