const BaseItem = require('./../BaseItem');

class InternalItem extends BaseItem {
    constructor(name, products, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, artifactJobActionConfig, artifactSettings) {
        super(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub);
        this.routeName = name;
        this.products = products;
        this.artifactJobActionConfig = artifactJobActionConfig;
        this.artifactSettings = artifactSettings;
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

class ItemSettings {
    constructor(schedule, recentRun) {
        this.schedule = schedule;
        this.recentRun = recentRun;
    }
}
module.exports = InternalItem;