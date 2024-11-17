const BaseProduct = require('./../BaseProduct');

class InternalProduct extends BaseProduct {
    constructor(name, displayName, fullDisplayName, description, favicon, icon, createExperience, workspaceSettings, productDetail, compatibleItemTypes, homePage) {
        super(name, displayName, fullDisplayName, description, favicon, icon, createExperience, workspaceSettings, productDetail, compatibleItemTypes);
        this.homePage = homePage;
    }
}

class HomePageItem {
    constructor(learningMaterials, recommendedArtifactTypes, newSection) {
        this.learningMaterials = learningMaterials;
        this.recommendedArtifactTypes = recommendedArtifactTypes;
        this.newSection = newSection;
    }
}
module.exports = InternalProduct;