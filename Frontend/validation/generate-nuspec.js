const fs = require('fs').promises;
const path = require('path');

const assetsDir = path.resolve(__dirname, '../Package/assets');
const packageDir = path.resolve(__dirname, '../Package');
const nuspecTemplatePath = path.resolve(__dirname, 'ManifestPackageRelease.template.nuspec');
const nuspecOutputPath = path.resolve(__dirname, 'ManifestPackageRelease.nuspec');

// Recursively get all files in a directory (async version)
async function getFilesRecursively(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return await getFilesRecursively(fullPath);
    } else {
      return fullPath;
    }
  }));
  return files.flat();
}

async function generateNuspec() {
  try {
    // Get all files recursively from assets directory
    const assetFiles = await getFilesRecursively(assetsDir);

    // Get all JSON files from Package directory, excluding Product.json
    const allFiles = await fs.readdir(packageDir);
    const otherJsonFiles = allFiles
      .filter(file => file.endsWith('.json') && file !== 'Product.json')
      .map(file => path.join(packageDir, file));
    
    // Combine both lists
    const files = [...otherJsonFiles, ...assetFiles];

    // Construct <file> entries
    let fileEntries = '';
    files.forEach(file => {
      const relativePath = path.relative(packageDir, file);
      fileEntries += `    <file src="../Package/${relativePath}" target="FE/${relativePath.replace(/\\/g, '/')}" />\n`;
    });

    // Read template
    const template = await fs.readFile(nuspecTemplatePath, 'utf-8');

    // Inject file entries into the template
    const output = template.replace('<!-- OTHER_FILES -->', fileEntries);

    // Write the output to the .nuspec file
    await fs.writeFile(nuspecOutputPath, output);

    console.log('✅ ManifestPackageRelease.nuspec generated successfully.');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Run the generation process
generateNuspec();