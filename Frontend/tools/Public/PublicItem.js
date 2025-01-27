const BaseItem = require('./../BaseItem');

class PublicItem extends BaseItem {
    constructor(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, supportedInDatahubL1, itemJobActionConfig, itemSettings, editorTab, itemJobTypes) {
        super(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, supportedInDatahubL1);
        this.itemJobActionConfig = itemJobActionConfig;
        this.itemSettings = itemSettings;
        this.editorTab = editorTab;
        this.itemJobTypes = itemJobTypes;
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

class GetItemSettings {
    constructor(action) {
        this.action = action;
    } 
}

class ItemSettingsItem {
    constructor(schedule, recentRun, getItemSettings) {
        this.schedule = schedule;
        this.recentRun = recentRun;
        this.getItemSettings = getItemSettings;
    }
}

module.exports = PublicItem;