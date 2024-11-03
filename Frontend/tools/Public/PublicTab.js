const BaseTab = require('../BaseTab');
class PublicTab extends BaseTab {
    constructor(
        params = {}
    ) {
        super();
        this.onInit = params.onInit;
        this.canDeactivate = params.canDeactivate;
        this.onDeactivate = params.onDeactivate;
        this.canDestroy = params.canDestroy;
        this.onDestroy = params.onDestroy;
        this.onDelete = params.onDelete;
        this.maxInstanceCount = params.maxInstanceCount || 1;
    }

    get onInit() {
        return this._onInit || PublicTab.getDefaultAction('onInit');
    }

    set onInit(value) {
        this._onInit = value;
    }

    get canDeactivate() {
        return this._canDeactivate || PublicTab.getDefaultAction('canDeactivate');
    }

    set canDeactivate(value) {
        this._canDeactivate = value;
    }

    get onDeactivate() {
        return this._onDeactivate || PublicTab.getDefaultAction('onDeactivate');
    }

    set onDeactivate(value) {
        this._onDeactivate = value;
    }

    get canDestroy() {
        return this._canDestroy || PublicTab.getDefaultAction('canDestroy');
    }

    set canDestroy(value) {
        this._canDestroy = value;
    }

    get onDestroy() {
        return this._onDestroy || PublicTab.getDefaultAction('onDestroy');
    }

    set onDestroy(value) {
        this._onDestroy = value;
    }

    get onDelete() {
        return this._onDelete || PublicTab.getDefaultAction('onDelete');
    }

    set onDelete(value) {
        this._onDelete = value;
    }

    static getDefaultAction(actionKey) {
        const defaultActions = ExtensibilityConstants.Validation.MultiTaskingDefaultActions;
        return defaultActions[actionKey] || null;
    }
}

class ExtensibilityConstants {
    static Validation = {
        MultiTaskingDefaultActions: {
            onInit: "multitasking.default-on-init",
            canDeactivate: "multitasking.default-can-deactivate",
            onDeactivate: "multitasking.default-on-deactivate",
            canDestroy: "multitasking.default-can-destroy",
            onDestroy: "multitasking.default-on-destroy",
            onDelete: "multitasking.default-on-delete"
        }
    };
}

module.exports = PublicTab;