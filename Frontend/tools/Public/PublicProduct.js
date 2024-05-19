const BaseProduct = require('../BaseProduct');
class PublicProduct extends BaseProduct {
    constructor(name, displayName, fullDisplayName, description, favicon, icon, createExperience, workspaceSettings, homePage) {
        super(name, displayName, fullDisplayName, description, favicon, icon, createExperience, workspaceSettings);
        this.homePage = homePage;
    }
}

class HomePageItem {
    constructor(learningMaterials, recommendedItemTypes) {
        this.learningMaterials = learningMaterials;
        this.recommendedItemTypes = recommendedItemTypes;
    }
}
module.exports = PublicProduct;