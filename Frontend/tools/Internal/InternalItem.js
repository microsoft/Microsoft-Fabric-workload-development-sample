const BaseItem = require('./../BaseItem');

class InternalItem extends BaseItem {
    constructor(name, products, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, supportedInDatahubL1, artifactJobActionConfig, artifactSettings, artifactJobTypes) {
        super(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, supportedInDatahubL1);
        this.routeName = name;
        this.products = products;
        this.artifactJobActionConfig = artifactJobActionConfig;
        this.artifactSettings = artifactSettings;
        this.artifactJobTypes = artifactJobTypes;
    }
}

class JobActionConfig {
    constructor(registeredActions) {
        this.registeredActions = registeredActions;
    }
}

class Schedule {
    constructor(artifactJobType, refreshType) {
        this.artifactJobType = artifactJobType;
        this.refreshType = refreshType;
    }
}

class GetArtifactSettings {
    constructor(extensionName, action) {
        this.extensionName = extensionName;
        this.action = action;
    } 
}

class ItemSettings {
    constructor(schedule, recentRun, getArtifactSettings) {
        this.schedule = schedule;
        this.recentRun = recentRun;
        this.getArtifactSettings = getArtifactSettings;
    }
}
module.exports = InternalItem;