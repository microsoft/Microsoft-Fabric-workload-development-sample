class InternalFinalJson {
    constructor(devParameters) {
        this.artifacts = [];
        this.product = null;
        this.assets = [];
        this.assetsV2 = {
            images: [],
            locales: []
        }
        this.tabs = [];
        this.extension = devParameters;
    }
}

module.exports = InternalFinalJson;