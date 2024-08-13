const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

// Load schemas
const itemSchema = require('./Item.schema.json');
const productSchema = require('./Product.schema.json');

// Constants
const MAX_COUNT_ASSETS = 15;
const MAX_ASSET_FILE_SIZE = 1572864; // 1.5 MB in bytes
const MAX_COUNT_JSONS = 10;
const ASSET_TYPES = ['.jpg', '.jpeg', '.png'];
const MAX_JSON_SIZE = 5000;
const ASSETS_DIR = './Package/assets/';
const ROOT_DIR = './Package/';

// Initialize validators
const validateItem = new Ajv().compile(itemSchema);
const validateProduct = new Ajv().compile(productSchema);

const itemDataMap = new Map();
// Load data
const productData = require('./../Package/Product.json');

// Validate Product
if (!validateProduct(productData)) {
  console.error('Product data is invalid:', validateProduct.errors);
  process.exit(1);
}

// Helper function to get file size
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Helper function to recursively find all icon references
function findIconReferences(obj) {
  let icons = [];
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('assets/')) {
        icons.push(obj[key].toLowerCase());
      } else {
        icons = icons.concat(findIconReferences(obj[key]));
      }
    }
  }
  return icons;
}

// Check assets directory
function validateAssetsDirectory() {
  const files = fs.readdirSync(ASSETS_DIR);
  if (files.length > MAX_COUNT_ASSETS) {
    console.error(`Number of files in ${ASSETS_DIR} exceeds the maximum limit of ${MAX_COUNT_ASSETS}.`);
    process.exit(1);
  }

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(ASSETS_DIR, file);

    if (!ASSET_TYPES.includes(ext)) {
      console.error(`Unsupported file extension in ${ASSETS_DIR}: ${file}`);
      process.exit(1);
    }

    if (getFileSize(filePath) > MAX_ASSET_FILE_SIZE) {
      console.error(`File size of ${file} exceeds the maximum limit of ${MAX_ASSET_FILE_SIZE} bytes.`);
      process.exit(1);
    }
  });
}

// Check root directory for JSON files
function validateRootDirectory() {
  const files = fs.readdirSync(ROOT_DIR).map(file => file);
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
  
  const notJsonFiles = files.filter(file => {
    const filePath = path.join(ROOT_DIR, file);
    return fs.statSync(filePath).isFile() && path.extname(file).toLowerCase() !== '.json';
  });

  if (jsonFiles.length > MAX_COUNT_JSONS) {
    console.error(`Number of JSON files in ${ROOT_DIR} exceeds the maximum limit of ${MAX_COUNT_JSONS}.`);
    process.exit(1);
  }

  if (notJsonFiles.length > 0) {
    console.error(`Unspoorted file extensions were found in ${ROOT_DIR}\nFiles: ${notJsonFiles.join(', ')}`);
    process.exit(1);
  }

  const productFile = jsonFiles.find(file => file.toLowerCase() === 'product.json');
  if (!productFile) {
    console.error('product.json file is missing in the root directory.');
    process.exit(1);
  }

  jsonFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (getFileSize(filePath) > MAX_JSON_SIZE) {
      console.error(`File size of ${file} exceeds the maximum limit of ${MAX_JSON_SIZE} bytes.`);
      process.exit(1);
    }
    if (file !== 'product.json') {
      const data = JSON.parse(fs.readFileSync(filePath));
      if (!validateItem(data)) {
        console.error(`${file} data is invalid:`, validateItem.errors);
        process.exit(1);
      }
      itemDataMap.set(file, data);
    }
  });
}

// Ensure all icon references in the JSON files exist in the assets folder
function validateIconReferences() {
  const itemIcons = new Set();
  itemDataMap.forEach((data, file) => {
    const icons = findIconReferences(data);
    icons.forEach(icon => itemIcons.add(icon));
  });
  const productIcons = findIconReferences(productData);
  const expectedIconsSet = new Set([...itemIcons, ...productIcons]);

  // Create a set of asset files
  const assetFilesSet = new Set(fs.readdirSync(ASSETS_DIR).map(file => `assets/${file.toLowerCase()}`));

  // Validate if all referenced icons exist in the assets folder
  expectedIconsSet.forEach(icon => {
    if (!assetFilesSet.has(icon)) {
      console.error(`Icon file ${icon} referenced in JSON data is missing in the assets folder.`);
      process.exit(1);
    }
  });

  // Validate if there are any unexpected files in the assets folder
  assetFilesSet.forEach(file => {
    if (!expectedIconsSet.has(file)) {
      console.error(`Unexpected file ${file} found in the assets folder.`);
      process.exit(1);
    }
  });
}



// Run validations
validateAssetsDirectory();
validateRootDirectory();
validateIconReferences();