const fs = require('fs');
const path = require('path');
const InternalFinalJson = require('./Internal/InternalFinalJson');
const PublicProduct = require('./Public/PublicProduct');
const PublicItem = require('./Public/PublicItem');
const PublicToInternalTransformer = require('./PublicToInternalTransformer');

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
                audience: process.env.DEV_AAD_CONFIG_AUDIENCE,
                appId: process.env.DEV_AAD_CONFIG_APPID,
                redirectUri: process.env.DEV_AAD_CONFIG_REDIRECT_URI
            }
        };

        this.internalFinalJson = new InternalFinalJson(devParameters);
    }

    async createFrontendJsonStreamAsync() {
        // Read all files in the Manifests folder
        const manifestFileNames = await fs.promises.readdir(this.manifestsFolderPath)
        const jsonFileNames = manifestFileNames.filter(fileName => fileName.endsWith('.json') && fileName != "localWorkloadManifest.json");

        for (const jsonEntry of jsonFileNames) {
            if (jsonEntry.toLowerCase() === 'product.json') {
                const filePath = path.join(this.manifestsFolderPath, jsonEntry);
                const content = await fs.promises.readFile(filePath, 'utf8');
                this.processProductJson(content);
                break;
            }
        }

        if (this.productName == "") {
            throw "Missing Product"
        }

        for (const jsonEntry of jsonFileNames) {
            if (jsonEntry.toLowerCase() !== 'product.json') {
                const filePath = path.join(this.manifestsFolderPath, jsonEntry);
                const content = await fs.promises.readFile(filePath, 'utf8');
                this.processItemJson(content);
            }
        }

        await this.processAssetEntriesAsync(path.join(this.manifestsFolderPath, "assets"));

        return JSON.stringify(this.internalFinalJson, null, 2);
    }

    processProductJson(jsonContent) {
        const publicProductSchema = Object.assign(new PublicProduct, JSON.parse(jsonContent));
        this.productName = publicProductSchema.name;

        const internalProductSchema = PublicToInternalTransformer.toInternal(publicProductSchema,this.workloadName);

        this.internalFinalJson.product = internalProductSchema;
    }

    processItemJson(jsonContent) {
        const publicItemSchema = Object.assign(new PublicItem, JSON.parse(jsonContent));
        const {internalItemSchema, tab} = PublicToInternalTransformer.toInternal(publicItemSchema, this.workloadName, this.productName);
        this.internalFinalJson.artifacts.push(internalItemSchema);
        this.internalFinalJson.tabs.push(tab);
    }

    async processAssetEntriesAsync(folderPath) {

        const internalAssetsJsons = [];

        const files = await fs.promises.readdir(folderPath);
        // Iterate over each file
        for (const file of files) {
            const imagePath = path.join(folderPath, file);
            const base64Image = await this.convertImageToBase64(imagePath);
            internalAssetsJsons.push({
                name: `${this.workloadName}/assets/${file}`,
                dataUrl: `data:image/${this.getImageMimeType(file)};base64,${base64Image}`
            });
        }

        this.internalFinalJson.assets = internalAssetsJsons;
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

        throw "Unsupported Image format"
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