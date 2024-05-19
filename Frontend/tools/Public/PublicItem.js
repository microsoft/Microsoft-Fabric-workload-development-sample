const BaseItem = require('./../BaseItem');

class PublicItem extends BaseItem {
    constructor(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, itemJobActionConfig, itemSettings) {
        super(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub);
        this.itemJobActionConfig = itemJobActionConfig;
        this.itemSettings = itemSettings;
    }
}

class JobActionConfig {
    constructor(registeredActions) {
        this.registeredActions = registeredActions;
    }
}

class Schedule {
    constructor(itemJobType, refreshType) {
        this.itemJobType = itemJobType;
        this.refreshType = refreshType;
    }
}

class ItemSettingsItem {
    constructor(schedule, recentRun) {
        this.schedule = schedule;
        this.recentRun = recentRun;
    }
}
module.exports = PublicItem;