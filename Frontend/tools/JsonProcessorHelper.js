const fs = require('fs');
const path = require('path');
const InternalFinalJson = require('./Internal/InternalFinalJson');
const PublicProduct = require('./Public/PublicProduct');
const PublicItem = require('./Public/PublicItem');
const PublicToInternalTransformer = require('./PublicToInternalTransformer');
const LocalizationHelper = require('./LocalizationHelper');

class JsonProcessorHelper {
    constructor() {
        this.workloadName = process.env.WORKLOAD_NAME;
        this.productName = '';
        this.manifestsFolderPath = path.join(__dirname, '../Package');

        // Parameters specific to FE Dev mode. 
        // The URL is the web app URL; in non-dev-mode, it's taken from WorkloadManifest.xml. 
        // Not customizable; should always be "http://127.0.0.1:60006".
        const devParameters = {
            name: this.workloadName,
            url: "http://127.0.0.1:60006",
            devAADAppConfig: {
                audience: process.env.DEV_AAD_CONFIG_BE_AUDIENCE,
                appId: process.env.DEV_AAD_CONFIG_BE_APPID,
                redirectUri: process.env.DEV_AAD_CONFIG_BE_REDIRECT_URI
            },
            devAADFEAppConfig: {
                appId: process.env.DEV_AAD_CONFIG_FE_APPID,
            }
        };

        this.internalFinalJson = new InternalFinalJson(devParameters);
    }

    async createFrontendJsonStreamAsync() {
        // Read all files in the Manifests folder
        const manifestFileNames = await fs.promises.readdir(this.manifestsFolderPath)
        const jsonFileNames = manifestFileNames.filter(fileName => fileName.endsWith('.json') && fileName != "localWorkloadManifest.json");
        const isLocalized = this.checkifLocalized();
        for (const jsonEntry of jsonFileNames) {
            if (jsonEntry.toLowerCase() === 'product.json') {
                const filePath = path.join(this.manifestsFolderPath, jsonEntry);
                const content = await fs.promises.readFile(filePath, 'utf8');
                this.processProductJson(content, isLocalized);
                break;
            }
        }

        if (this.productName == "") {
            throw new Error("Missing Product");
        }

        for (const jsonEntry of jsonFileNames) {
            if (jsonEntry.toLowerCase() !== 'product.json') {
                const filePath = path.join(this.manifestsFolderPath, jsonEntry);
                const content = await fs.promises.readFile(filePath, 'utf8');
                this.processItemJson(content, isLocalized);
            }
        }

        await this.processAssetEntriesAsync(path.join(this.manifestsFolderPath, "assets"), isLocalized);

        return JSON.stringify(this.internalFinalJson, null, 2);
    }

    processProductJson(jsonContent, isLocalized) {
        const publicProductSchema = Object.assign(new PublicProduct, JSON.parse(jsonContent));
        this.productName = publicProductSchema.name;

        const internalProductSchema = PublicToInternalTransformer.toInternal(publicProductSchema, this.workloadName, isLocalized);

        this.internalFinalJson.product = internalProductSchema;
    }

    processItemJson(jsonContent, isLocalized) {
        const publicItemSchema = Object.assign(new PublicItem, JSON.parse(jsonContent));
        const { internalItemSchema, tab } = PublicToInternalTransformer.toInternal(publicItemSchema, this.workloadName, this.productName, isLocalized);
        this.internalFinalJson.artifacts.push(internalItemSchema);
        this.internalFinalJson.tabs.push(tab);
    }

    async processAssetEntriesAsync(folderPath, isLocalized) {
        await this.processImageEntriesAsync(folderPath, isLocalized);
        if (isLocalized) {
            await this.processLocaleEntriesAsync(path.join(folderPath, "locales"));
        }
    }

    async checkifLocalized() {
        try {
            const assetFolderContents = await fs.promises.readdir(path.join(this.manifestsFolderPath, "assets"), { withFileTypes: true });
            const fileCheckPromises = assetFolderContents.map((entry) => {
                const filePath = path.join(this.manifestsFolderPath, "assets", entry.name);
                return fs.promises.stat(filePath).then(stats => stats.isFile());
            });

            const containsFiles = await Promise.all(fileCheckPromises);
            if (containsFiles.some(isFile => isFile)) {
                return false;
            }

            const subfolderNames = assetFolderContents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
            const hasImages = subfolderNames.includes('images');
            const hasLocales = subfolderNames.includes('locales');

            return hasImages && hasLocales;
        } catch (error) {
            console.error(`Error reading folder ${path.join(this.manifestsFolderPath, "assets")}:`, error);
            return false;
        }
    }

    async processImageEntriesAsync(folderPath, isLocalized) {
        const internalImageJsons = [];
        const imagesFolderPath = isLocalized ? path.join(folderPath, "images") : folderPath;
        const files = await fs.promises.readdir(imagesFolderPath);
        // Iterate over each file
        for (const file of files) {
            const imagePath = path.join(imagesFolderPath, file);
            const base64Image = await this.convertImageToBase64(imagePath);
            const name = isLocalized ? `${this.workloadName}/assets/images/${file}` : `${this.workloadName}/assets/${file}`;
            internalImageJsons.push({
                name: name,
                dataUrl: `data:image/${this.getImageMimeType(file)};base64,${base64Image}`
            });
        }
        if (isLocalized) {
            this.internalFinalJson.assetsV2.images = internalImageJsons;
        } else {
            this.internalFinalJson.assets = internalImageJsons;
        }
    }

    async processLocaleEntriesAsync(folderPath) {
        const keysInManifests = LocalizationHelper.getLocalizedKeys(this.internalFinalJson);
        const providedLanguages = await fs.promises.readdir(folderPath, { recursive: false });
        if (!providedLanguages.includes('en-US')) {
            throw new Error("Missing en-US locale");
        }
        const internalLocaleJsons = [];
        const promises = providedLanguages.map(async (language) => {
            const localePath = path.join(folderPath, language, 'translations.json');
            return fs.promises.readFile(localePath, 'utf-8')
                .then(localeJson => {
                    const parsedJson = JSON.parse(localeJson);
                    const uniqueLocaleDict = LocalizationHelper.generateUniqueLocaleDict(parsedJson, this.workloadName);

                    internalLocaleJsons.push({
                        languageCode: language,
                        translations: uniqueLocaleDict
                    });

                    if (language === 'en-US') {
                        LocalizationHelper.verifyDefaultLocaleContainsAllKeys(uniqueLocaleDict, keysInManifests);
                    }
                });
        });

        await Promise.all(promises);
        const resolvedInternalLocaleJsons = LocalizationHelper.resolveMissingKeys(internalLocaleJsons, keysInManifests);
        this.internalFinalJson.assetsV2.locales = resolvedInternalLocaleJsons;
    }

    getImageMimeType(imageName) {
        if (imageName.endsWith('.svg')) {
            return 'svg+xml';
        } else if (imageName.endsWith('.png')) {
            return 'png';
        } else if (imageName.endsWith('.jpg') || imageName.endsWith('.jpeg')) {
            return 'jpeg';
        } else if (imageName.endsWith('.ico')) {
            return 'x-icon';
        }

        throw new Error("Unsupported Image format");
    }

    // Function to convert image to base64
    async convertImageToBase64(imagePath) {
        // Read the image file
        const imageData = await fs.promises.readFile(imagePath);
        // Convert image data to base64
        const base64Image = imageData.toString('base64');

        return base64Image;
    }
}

module.exports = JsonProcessorHelper;