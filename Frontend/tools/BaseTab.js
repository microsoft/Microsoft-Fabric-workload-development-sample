class BaseTab {
    constructor() {
      // Default value for AllowMultipleTabs
      this.allowMultipleTabs = "allow";
    }
}

class IconItem {
    constructor(name) {
        this.name = name;
    }
}

module.exports = BaseTab;