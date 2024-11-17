class LocalizationHelper {
    static generateUniqueLocaleDict(localeDict, workloadName) {
        const uniqueLocaleDict = {};
        for (const key in localeDict) {
            uniqueLocaleDict[`${workloadName}::${key}`] = localeDict[key];
        }
        return uniqueLocaleDict;
    }

    static verifyDefaultLocaleContainsAllKeys(localeDict, keysInManifests) {
        var localeKeys = Object.keys(localeDict);
        const unusedKeys = localeKeys.filter(key => !keysInManifests.has(key));
        if (unusedKeys.length > 0) {
            throw new Error(`The following keys are present in the locale file but are not used in the manifest: ${unusedKeys.join(', ')}`);
        }
        const missingKeys = Array.from(keysInManifests).filter(key => !localeKeys.includes(key));
        if (missingKeys.length > 0) {
            throw new Error(`The following keys are missing in the locale file: ${missingKeys.join(', ')}`);
        }
    }

    static resolveMissingKeys(internalLocaleJsons, keysInManifests) {
        const defaultLocale = internalLocaleJsons.find(x => x.languageCode.toLowerCase() === 'en-us');
        const defaultTranslations = defaultLocale?.translations;

        internalLocaleJsons.forEach(locale => {
            const translations = locale.translations;
            keysInManifests.forEach(key => {
                if (!translations.hasOwnProperty(key)) {
                    translations[key] = defaultTranslations[key];
                }
            });
        });

        return internalLocaleJsons;
    }

    static getLocalizedKeys(internalFinalJson) {
        const localizedKeys = new Set();
        internalFinalJson.artifacts.forEach(artifact => {
            this.GetLocalizedKeysFromItemManifest(artifact).forEach(key => localizedKeys.add(key));
        });

        this.GetLocalizedKeysFromProductManifest(internalFinalJson.product).forEach(key => localizedKeys.add(key));
        return localizedKeys;
    }

    static GetLocalizedKeysFromProductManifest(internalProduct) {
        const localizedKeys = this.extractLocalizedKeys(internalProduct, ['displayName', 'fullDisplayName', 'description']);
        this.GetLocalizedKeysFromProductDetail(internalProduct.productDetail).forEach(key => localizedKeys.add(key));
        this.GetLocalizedKeysFromHomePage(internalProduct.homePage).forEach(key => localizedKeys.add(key));
        this.GetLocalizedKeysFromCreateExperienceItem(internalProduct.createExperience).forEach(key => localizedKeys.add(key));

        return localizedKeys;
    }

    static GetLocalizedKeysFromItemManifest(internalItem) {
        const localizedKeys = this.extractLocalizedKeys(internalItem, ['displayName', 'displayNamePlural']);
        if (internalItem.contextMenuItems) {
            internalItem.contextMenuItems.forEach(item => {
                this.GetLocalizedKeysFromMenuItem(item).forEach(key => localizedKeys.add(key));
            });
        }
        if (internalItem.quickActionItems) {
            internalItem.quickActionItems.forEach(item => {
                this.GetLocalizedKeysFromMenuItem(item).forEach(key => localizedKeys.add(key));
            });
        }
        return localizedKeys;
    }

    static GetLocalizedKeysFromMenuItem(menuItem) {
        return this.extractLocalizedKeys(menuItem, ['displayName', 'tooltip']);
    }

    static GetLocalizedKeysFromHomePage(homePageItem) {
        const localizedKeys = new Set();
        if (homePageItem.learningMaterials) {
            homePageItem.learningMaterials.forEach(item => {
                this.GetLocalizedKeysFromHomePageLearningMaterial(item).forEach(key => localizedKeys.add(key));
            });
        }
        if (homePageItem.newSection) {
            this.GetLocalizedKeysFromHomePageNewSection(homePageItem.newSection).forEach(key => localizedKeys.add(key));
        }
        return localizedKeys;
    }

    static GetLocalizedKeysFromHomePageLearningMaterial(homePageLearningMaterial) {
        return this.extractLocalizedKeys(homePageLearningMaterial, ['title', 'description', 'introduction']);
    }

    static GetLocalizedKeysFromHomePageNewSection(newSectionSettings) {
        const localizedKeys = new Set();

        if (newSectionSettings.customActions) {
            newSectionSettings.customActions.forEach(card => {
                this.GetLocalizedKeysFromHomePageNewSectionCustomActions(card).forEach(key => localizedKeys.add(key));
            });
        }
        return localizedKeys;
    }

    static GetLocalizedKeysFromHomePageNewSectionCustomActions(homePageNewSectionCustomActions) {
        return this.extractLocalizedKeys(homePageNewSectionCustomActions, ['title']);
    }

    static GetLocalizedKeysFromProductDetail(productDetail) {
        return this.extractLocalizedKeys(productDetail, ['slogan', 'description']);
    }

    static GetLocalizedKeysFromCreateExperienceItem(createExperienceItem) {
        const localizedKeys = this.extractLocalizedKeys(createExperienceItem, ['description']);
        if (createExperienceItem.cards) {
            createExperienceItem.cards.forEach(card => {
                this.GetLocalizedKeysFromCreateCard(card).forEach(key => localizedKeys.add(key));
            });
        }
        return localizedKeys;
    }

    static GetLocalizedKeysFromCreateCard(createCard) {
        return this.extractLocalizedKeys(createCard, ['title', 'description']);
    }

    static extractLocalizedKeys(object, keys) {
        const localizedKeys = new Set();
        for (const key of keys) {
            if (object[key]) {
                localizedKeys.add(object[key]);
            }
        }
        return localizedKeys;
    }
}

module.exports = LocalizationHelper;