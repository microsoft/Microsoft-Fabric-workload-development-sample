class BaseProduct {
    constructor(name, displayName, fullDisplayName, description, favicon, icon, createExperience, workspaceSettings, productDetail, compatibleItemTypes) {
        this.name = name;
        this.displayName = displayName;
        this.fullDisplayName = fullDisplayName;
        this.description = description;
        this.favicon = favicon;
        this.icon = icon;
        this.createExperience = createExperience;
        this.workspaceSettings = workspaceSettings;
        this.productDetail = productDetail;
        this.compatibleItemTypes = compatibleItemTypes;
    }
}

class OnClick {
    constructor(extensionName, action) {
        this.extensionName = extensionName;
        this.action = action;
    }
}

class IconItem {
    constructor(name) {
        this.name = name;
    }
}

class Card {
    constructor(title, description, icon, icon_small, onClick, availableIn, visibilityChecker) {
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.icon_small = icon_small;
        this.onClick = onClick;
        this.availableIn = availableIn;
        this.visibilityChecker = visibilityChecker;
    }
}

class CreateExperienceItem {
    constructor(description, cards) {
        this.description = description;
        this.cards = cards;
    }
}

class GetWorkspaceSettings {
    constructor(workloadName, action) {
        this.workloadName = workloadName;
        this.action = action;
    }
}

class WorkspaceSettingsItem {
    constructor(getWorkspaceSettings) {
        this.getWorkspaceSettings = getWorkspaceSettings;
    }
}

class HomePageLearningMaterial {
    constructor(title, description, image, onClick) {
        this.title = title;
        this.description = description;
        this.image = image;
        this.onClick = onClick;
    }
}

class ProductDetailItem {
    constructor(publisher, slogan, description, image, slideMedia, supportLinks) {
        this.publisher = publisher;
        this.slogan = slogan;
        this.description = description;
        this.image = image;
        this.slideMedia = slideMedia;
        this.supportLinks = supportLinks;
    }
}

class Media {
    constructor(mediaType, source) {
        this.mediaType = mediaType;
        this.source = source;
    }
}

module.exports = BaseProduct;