const fs = require("fs").promises;
const { exec } = require("child_process");
const util = require("util");
const os = require("os");
const path = require("path");

const execAsync = util.promisify(exec);

// Update path to point to scripts from project root
const buildManifestPackageScript = path.resolve(__dirname, "../scripts/Build/BuildManifestPackage.ps1");

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

// Optional: Execute when run directly
if (require.main === module) {
  buildManifestPackage();
}