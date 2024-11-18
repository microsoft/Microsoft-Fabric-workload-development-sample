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
const MAX_COUNT_LOCALES = 44; // number of languages supported by Fabric
const ASSET_TYPES = ['.jpg', '.jpeg', '.png'];
const MAX_JSON_SIZE = 5000;
const MAX_LOCALE_SIZE = 20 * 1024; // 20 KB in bytes
const ASSETS_DIR = './Package/assets/';
const LOCALES_DIR = './Package/assets/locales/';
const ROOT_DIR = './Package/';
const LOCALIZATION_KEY_REGEX = /^[a-zA-Z0-9_-]+$/;

// Initialize validators
const validateItem = new Ajv().compile(itemSchema);
const validateProduct = new Ajv().compile(productSchema);

// Red color place holder (and back to normal)
const errorColor = "'\x1b[31m%s\x1b[0m'";

const itemDataMap = new Map();
// Load data
const productData = require('./../Package/Product.json');
const { get } = require('http');

// Validate Product
if (!validateProduct(productData)) {
  console.error(errorColor, 'Product data is invalid:', validateProduct.errors);
  process.exit(1);
}

// Helper function to get file size
async function getFileSize(filePath) {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

// Helper function to recursively find all icon references
function findIconReferences(obj, localized) {
  let prefix;
  if (localized) {
    prefix = 'assets/images/'
  }
  else {
    prefix = 'assets/'
  }
  let icons = [];
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith(prefix)) {
        icons.push(obj[key].toLowerCase());
      } else {
        icons = icons.concat(findIconReferences(obj[key]));
      }
    }
  }
  return icons;
}

//Helper function to recursively find all files in a directory
async function getAllFiles(dirPath, arrayOfFiles) {
  let files = await fs.promises.readdir(dirPath)
  arrayOfFiles = arrayOfFiles || []

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = await fs.promises.stat(filePath);

    if (fileStat.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }

  return arrayOfFiles;
}

// Helper function to extract all localizable keys from manifest files
async function getAllKeysInManifests() {
  // Read all files in the root directory
  const files = await fs.promises.readdir(ROOT_DIR);
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
  
  const localizedKeys = [
    'displayName', 
    'fullDisplayName', 
    'displayNamePlural', 
    'description', 
    'introduction', 
    'title', 
    'tooltip', 
    'slogan'
  ];
  
  const keysInManifests = [];

  // Use a for...of loop to handle asynchronous operations
  for (const file of jsonFiles) {
    const filePath = path.join(ROOT_DIR, file);
    const data = JSON.parse(await fs.promises.readFile(filePath));
    
    // Extract values and push them into the keysInManifests array
    keysInManifests.push(...extractValuesFromJson(data, localizedKeys));
  }

  return keysInManifests;
}

// Helper function to extract values from JSON based on list of keys
function extractValuesFromJson(data, keys, values = []) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      extractValuesFromJson(value, keys, values);
    } else if (keys.includes(key) && value !== undefined) {
      values.push(value);
    }
  }
  return values;
}

// Helper function to identify if the data is a string dictionary
function isStringDictionary(data) {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  return Object.entries(data).every(([key, value]) => typeof key === 'string' && typeof value === 'string');
}
// Helper function to validate locale contents
function validateLocaleContents(locale, data, keysInManifests) {
  const keysInLocale = Object.keys(data);
  if (locale === 'en-US') {
    validateNoMissingKeys(locale, keysInLocale, keysInManifests);
  }
  validateNoExtraKeys(locale, keysInLocale, keysInManifests);
}

// Helper function to make sure no keys are missing in the locale
function validateNoMissingKeys(locale, keysInLocale, keysInManifests) {
  keysInManifests.forEach(key => {
    if (!keysInLocale.includes(key)) {
      console.error(errorColor, `Key ${key} is missing in ${locale} locale.`);
      process.exit(1);
    }
  });
}

// Helper function to make sure no extra keys are present in the locale
function validateNoExtraKeys(locale, keysInLocale, keysInManifests) {
  keysInLocale.forEach(key => {
    if (!keysInManifests.includes(key)) {
      console.error(errorColor, `Key ${key} is not present in any manifest but found in ${locale} locale.`);
      process.exit(1);
    }
  });
}

// Check assets directory
async function validateAssetsDirectory() {
  let localized = await isLocalized();
  const imageFiles = localized ? await fs.promises.readdir(path.join(ASSETS_DIR, 'images')) : await fs.promises.readdir(ASSETS_DIR);
  await validateImagesDirectory(imageFiles);
  if (localized) {
    await validateLocaleDirectory();
  }
}

async function validateImagesDirectory(imageFiles) {
  let localized = await isLocalized();
  if (imageFiles.length > MAX_COUNT_ASSETS) {
    console.error(errorColor, `Number of files in ${ASSETS_DIR} exceeds the maximum limit of ${MAX_COUNT_ASSETS}.`);
    process.exit(1);
  }

  for (const file of imageFiles) {
    const ext = path.extname(file).toLowerCase();
    const filePath = localized ? path.join(ASSETS_DIR, 'images', file) : path.join(ASSETS_DIR, file);
  
    if (!ASSET_TYPES.includes(ext)) {
      console.error(errorColor, `Unsupported file extension in ${ASSETS_DIR}: ${file}`);
      process.exit(1);
    }
  
    if (await getFileSize(filePath) > MAX_ASSET_FILE_SIZE) {
      console.error(errorColor, `File size of ${file} exceeds the maximum limit of ${MAX_ASSET_FILE_SIZE} bytes.`);
      process.exit(1);
    }
  }
}

async function validateLocaleDirectory() {
  const localeFiles = await getAllFiles(LOCALES_DIR);

  const localeJsonFiles = localeFiles.filter(file => path.extname(file).toLowerCase() === '.json');
  // Get non-JSON files using Promise.all
  const notJsonFiles = await Promise.all(localeFiles.map(async (file) => {
    const filePath = path.join(file);
    const stat = await fs.promises.stat(filePath);
    return (stat.isFile() && path.extname(file).toLowerCase() !== '.json') ? file : null;
  }));

  // Filter out null values
  const filteredNotJsonFiles = notJsonFiles.filter(Boolean);

  if (filteredNotJsonFiles.length > 0) {
    console.error(errorColor, `Unsupported file extensions were found in ${LOCALES_DIR}\nFiles: ${notJsonFiles.join(', ')}`);
    process.exit(1);
  }
  if (localeJsonFiles.length > MAX_COUNT_JSONS) {
    console.error(errorColor, `Number of JSON locale files in ${LOCALES_DIR} exceeds the maximum limit of ${MAX_COUNT_LOCALES}.`);
    process.exit(1);
  }

  let languageCodes = new Set();

  for (const file of localeFiles) {
    const languageCode = path.dirname(file).split(path.sep).pop();
    
    if (languageCodes.has(languageCode)) {
      console.error(errorColor, `Multiple files provided for language code: ${languageCode}`);
      process.exit(1);
    }
  
    languageCodes.add(languageCode);
  
    const filePath = path.join(file);
    
    if (await getFileSize(filePath) > MAX_LOCALE_SIZE) {
      console.error(errorColor, `File size of ${file} exceeds the maximum limit of ${MAX_LOCALE_SIZE} bytes.`);
      process.exit(1);
    }
  }

  if (!languageCodes.has("en-US")) {
    console.error(errorColor, `Language code en-US is missing in the locales directory.`);
    process.exit(1);
  }

  const keysInManifests = await getAllKeysInManifests();
  const keysWithSpecialChars = keysInManifests.filter(key => !LOCALIZATION_KEY_REGEX.test(key));
  if (keysWithSpecialChars.length > 0) {
    console.error(errorColor, `The following keys provided in the manifests contain special characters: ${keysWithSpecialChars.join(', ')}. Only alphanumeric characters, hyphens, and underscores are allowed.`);
    process.exit(1);
  }

  for (const file of localeFiles) {
    const languageCode = path.dirname(file).split(path.sep).pop();
    try {
      const filePath = path.join(file);
      const data = JSON.parse(await fs.promises.readFile(filePath));
      
      if (!isStringDictionary(data)) {
        console.error(errorColor, `Locale file ${file} is not a valid dictionary. All keys and values must be strings.`);
        process.exit(1);
      }
      
      validateLocaleContents(languageCode, data, keysInManifests);
    } catch (error) {
      console.error(errorColor, `Error parsing ${file}. Ensure file is in valid JSON format:`, error);
      process.exit(1);
    }
  }
}

// Check root directory for JSON files
async function validateRootDirectory() {
  const files = await fs.promises.readdir(ROOT_DIR);
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

  // Get non-JSON files using Promise.all
  const notJsonFiles = await Promise.all(files.map(async (file) => {
    const filePath = path.join(ROOT_DIR, file);
    const stat = await fs.promises.stat(filePath);
    return (stat.isFile() && path.extname(file).toLowerCase() !== '.json') ? file : null;
  }));

  // Filter out null values
  const filteredNotJsonFiles = notJsonFiles.filter(Boolean);

  if (jsonFiles.length > MAX_COUNT_JSONS + 1) {
    console.error(errorColor, `Number of JSON files in ${ROOT_DIR} exceeds the maximum limit of ${MAX_COUNT_JSONS + 1}.`);
    process.exit(1);
  }

  if (filteredNotJsonFiles.length > 0) {
    console.error(errorColor, `Unsupported file extensions were found in ${ROOT_DIR}\nFiles: ${filteredNotJsonFiles.join(', ')}`);
    process.exit(1);
  }

  const productFile = jsonFiles.find(file => file.toLowerCase() === 'product.json');
  if (!productFile) {
    console.error(errorColor, 'product.json file is missing in the root directory.');
    process.exit(1);
  }

  // Validate each JSON file
  for (const file of jsonFiles) {
    const filePath = path.join(ROOT_DIR, file);

    if (await getFileSize(filePath) > MAX_JSON_SIZE) {
      console.error(errorColor, `File size of ${file} exceeds the maximum limit of ${MAX_JSON_SIZE} bytes.`);
      process.exit(1);
    }

    if (file !== 'product.json') {
      const data = JSON.parse(await fs.promises.readFile(filePath));

      // Validate the data against the schema
      if (!validateItem(data)) {
        console.error(errorColor, `${file} data is invalid:`, validateItem.errors);
        process.exit(1);
      }

      itemDataMap.set(file, data);
    }
  }
}

// Ensure all icon references in the JSON files exist in the assets folder
async function validateIconReferences() {
  const localized = await isLocalized();
  const itemIcons = new Set();
  itemDataMap.forEach((data, file) => {
    const icons = findIconReferences(data, localized);
    icons.forEach(icon => itemIcons.add(icon));
  });
  const productIcons = findIconReferences(productData);
  const expectedIconsSet = new Set([...itemIcons, ...productIcons]);

  // Create a set of asset files
  const assetFilesSet = localized ?
    new Set((await fs.promises.readdir(path.join(ASSETS_DIR, 'images'))).map(file => `assets/images/${file.toLowerCase()}`)) :
    new Set((await fs.promises.readdir(ASSETS_DIR)).map(file => `assets/${file.toLowerCase()}`));

  // Validate if all referenced icons exist in the assets folder
  expectedIconsSet.forEach(icon => {
    if (!assetFilesSet.has(icon)) {
      console.error(errorColor, `Icon file ${icon} referenced in JSON data is missing in the assets folder.`);
      process.exit(1);
    }
  });

  // Validate if there are any unexpected files in the assets folder
  assetFilesSet.forEach(file => {
    if (!expectedIconsSet.has(file)) {
      console.error(errorColor, `Unexpected file ${file} found in the assets folder.`);
      process.exit(1);
    }
  });
}

// helper function to determine if package is localized
async function isLocalized() {
  let files = await fs.promises.readdir(ASSETS_DIR);
  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    if ((await fs.promises.stat(filePath)).isFile() && ASSET_TYPES.includes(path.extname(file).toLowerCase())) {
      return false;
    }
  }
  const hasLocalesDir = files.includes('locales') && (await fs.promises.stat(path.join(ASSETS_DIR, 'locales'))).isDirectory();
  const hasImagesDir = files.includes('images') && (await fs.promises.stat(path.join(ASSETS_DIR, 'images'))).isDirectory();

  return hasLocalesDir && hasImagesDir;
}


async function validate()
{
// Run validations
// Order Is important so no promise all here
await validateRootDirectory();
await validateAssetsDirectory();
await validateIconReferences();
}
validate();
