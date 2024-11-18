class BaseItem {
    constructor(name, displayName, displayNamePlural, editor, icon, activeIcon, contextMenuItems, quickActionItems, supportedInMonitoringHub, supportedInDatahubL1) {
        this.name = name;
        this.displayName = displayName;
        this.displayNamePlural = displayNamePlural;
        this.editor = editor;
        this.icon = icon;
        this.activeIcon = activeIcon;
        this.contextMenuItems = contextMenuItems;
        this.quickActionItems = quickActionItems;
        this.supportedInMonitoringHub = supportedInMonitoringHub;
        this.supportedInDatahubL1 = supportedInDatahubL1;
    }
}

class IconItem {
    constructor(name) {
        this.name = name;
    }
}

class Handler {
    constructor(extensionName, action) {
        this.extensionName = extensionName;
        this.action = action;
    }
}

class EditorItem {
    constructor(extension, path) {
        this.extension = extension;
        this.path = path;
    }
}

class MenuItem {
    constructor(name, displayName, icon, handler, tooltip) {
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
        this.handler = handler;
        this.tooltip = tooltip;
    }
}

class RegisteredActions {
    constructor(detail, cancel, retry) {
        this.detail = detail;
        this.cancel = cancel;
        this.retry = retry;
    }
}

class RecentRun {
    constructor(useRecentRunsComponent) {
        this.useRecentRunsComponent = useRecentRunsComponent;
    }
}
module.exports = BaseItem;