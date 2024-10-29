const BaseTab = require('./../BaseTab');
class InternalTab extends BaseTab {
    constructor({
      displayName,
      displayNamePlural,
      name,
      artifactType,
      icon,
      getTabId,
      onInit,
      canDeactivate,
      onDeactivate,
      canDestroy,
      onDestroy,
      onDelete,
      maxInstanceCount
    } = {}) {
      super();
      this.displayName = displayName;
      this.displayNamePlural = displayNamePlural;
      this.name = name;
      this.artifactType = artifactType;
      this.icon = icon;
      this.getTabId = getTabId;
      this.onInit = onInit;
      this.canDeactivate = canDeactivate;
      this.onDeactivate = onDeactivate;
      this.canDestroy = canDestroy;
      this.onDestroy = onDestroy;
      this.onDelete = onDelete;
      this.maxInstanceCount = maxInstanceCount;
    }
  }
  
  // Handler class
  class Handler {
    constructor({ action, extensionName, iframeType} = {}) {
      this.action = action;
      this.extensionName = extensionName;
      this.iframeType = iframeType;
    }
  }
  module.exports = InternalTab;