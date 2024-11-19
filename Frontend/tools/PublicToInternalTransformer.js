const PublicProduct = require('./Public/PublicProduct');
const PublicItem = require('./Public/PublicItem');
const InternalProduct = require('./Internal/InternalProduct');
const InternalItem = require('./Internal/InternalItem');
const PublicTab = require('./Public/PublicTab');
const InternalTab = require('./Internal/InternalTab');

class PublicToInternalTransformer {
    static toInternal(publicSchema, workloadName, isLocalized, productName = "") {
        const prefix = isLocalized ? `${workloadName}::` : "";

        if (!publicSchema) {
            return null;
        }

        if (publicSchema instanceof PublicProduct) {
            return this.ProductToInternal(publicSchema, workloadName, prefix);
        } else if (publicSchema instanceof PublicItem) {
            return this.ItemToInternal(publicSchema, workloadName, productName , prefix);
        }
    }

    static ProductToInternal(publicSchema, workloadName, prefix) {
        const internalSchema = new InternalProduct(
            `${workloadName}.${publicSchema.name}`,
            prefix + publicSchema.displayName,
            prefix + publicSchema.fullDisplayName,
            prefix + publicSchema.description,
            `${workloadName}/${publicSchema.favicon}`,
            { name: `${workloadName}/${publicSchema.icon.name}` },
            this.CreateExperienceToInternal(publicSchema.createExperience, workloadName, prefix),
            this.WorkspaceSettingsToInternal(publicSchema.workspaceSettings, workloadName, prefix),
            this.ProductDetailToInternal(publicSchema.productDetail, workloadName, prefix),
            publicSchema.compatibleItemTypes,
            this.HomePageToInternal(publicSchema.homePage, workloadName, prefix),
        );

        return internalSchema;
    }


    static ItemToInternal(publicSchema, workloadName, productName, prefix) {
        const itemName = `${workloadName}.${publicSchema.name}`;
        const internalItemSchema = new InternalItem(
            itemName,
            [`${workloadName}.${productName}`],
            prefix + publicSchema.displayName,
            prefix + publicSchema.displayNamePlural,
            { ...publicSchema.editor, extension: workloadName },
            { ...publicSchema.icon, name: `${workloadName}/${publicSchema.icon.name}` },
            { ...publicSchema.activeIcon, name: `${workloadName}/${publicSchema.activeIcon.name}` },
            publicSchema.contextMenuItems?.map(mi => this.MenuItemToInternal(mi, workloadName, prefix)),
            publicSchema.quickActionItems?.map(mi => this.MenuItemToInternal(mi, workloadName,prefix)),
            publicSchema.supportedInMonitoringHub,
            publicSchema.supportedInDatahubL1,
            this.JobActionConfigToInternal(publicSchema.itemJobActionConfig, workloadName, prefix),
            this.ItemSettingsToInternal(publicSchema.itemSettings, itemName, prefix),
            publicSchema.itemJobTypes
        );

        publicSchema.editorTab = new PublicTab(publicSchema.editorTab) ?? new PublicTab();
        const tab = this.ToInternal(publicSchema, workloadName);

        return {internalItemSchema,tab};
    }

    static ToInternal(publicItem, workloadName) {
        return new InternalTab({
            name: `${workloadName}.${publicItem.name}`,
            displayName: `${publicItem.displayName}`,
            displayNamePlural: `${publicItem.displayNamePlural}`,
            artifactType: `${workloadName}.${publicItem.name}`,
            icon: { name: `${workloadName}/${publicItem.icon.name}` },
            onInit: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'onInit'),
            onDeactivate: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'onDeactivate'),
            canDeactivate: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'canDeactivate'),
            canDestroy: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'canDestroy'),
            onDestroy: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'onDestroy'),
            onDelete: this.CreateTabActionObj(publicItem.editorTab, workloadName, 'onDelete'),
            maxInstanceCount: publicItem.editorTab.maxInstanceCount
        });
    }

    static CreateTabActionObj(editorTab, workloadName, actionName) {
        const action = editorTab[actionName];
        return {
            action,
            ...(action !== PublicTab.getDefaultAction(actionName) && { extensionName: workloadName, iframeType: "page" })
        };
    }

    static MenuItemToInternal(publicSchema, workloadName, prefix) {
        if (!publicSchema || !publicSchema.handler || !publicSchema.icon) {
            return publicSchema;
        }

        return {
            ...publicSchema,
            displayName: prefix + publicSchema.displayName,
            tooltip: prefix + publicSchema.tooltip,
            handler: this.HandlerForWorkload(publicSchema.handler, workloadName),
            icon: { ...publicSchema.icon, name: `${workloadName}/${publicSchema.icon.name}` }
        };
    }

    static HandlerForWorkload(handler, workloadName) {
        if (!handler) {
            return null;
        }

        return { ...handler, extensionName: workloadName };
    }

    static HomePageToInternal(publicHomePage, workloadName, prefix) {
        if (!publicHomePage) {
            return null;
        }

        return {
            title: publicHomePage.title ? prefix + publicHomePage.title : null,
            description: publicHomePage.description ? prefix + publicHomePage.description : null,
            learningMaterials: publicHomePage.learningMaterials.map(lm => this.LearningMaterialForWorkload(lm, workloadName, prefix)),
            recommendedArtifactTypes: publicHomePage.recommendedItemTypes.map(it => `${workloadName}.${it}`),
            newSection: this.NewSectionToInternal(publicHomePage.newSection, workloadName, prefix)
        };
    }

    static ProductDetailToInternal(publicProductDetail, workloadName, prefix) {
        if (!publicProductDetail) {
            return null;
        }

        return {
            ...publicProductDetail,
            slogan: prefix + publicProductDetail.slogan,
            description: prefix + publicProductDetail.description,
            image: {
                mediaType: 0,
                source: `${workloadName}/${publicProductDetail.image.source}`
            },
            slideMedia: publicProductDetail.slideMedia.map(media => ({
                mediaType: media.mediaType,
                source: media.mediaType === 0 ? `${workloadName}/${media.source}` : media.source
            }))
        };
    }

    static LearningMaterialForWorkload(material, workloadName, prefix) {
        if (!material) {
            return null;
        }

        return {
            ...material,
            title: prefix + material.title,
            description: prefix + material.description,
            introduction: material.introduction ? prefix + material.introduction: null,
            onClick: this.LearningMaterialHandlerForWorkload(material.onClick, workloadName),
            image: `${workloadName}/${material.image}`
        };
    }

    static LearningMaterialHandlerForWorkload(handler, workloadName) {
        if (!handler) {
            // return undefined to indicate that the handler is not set and should be removed from the manifest
            return undefined;
        }

        return { ...handler, extensionName: workloadName };
    }

    static NewSectionToInternal(publicNewSection, workloadName, prefix) {
        if (!publicNewSection) {
            return null;
        }

        return {
            customActions: publicNewSection.customActions?.map(card => this.HomeCardForWorkload(card, workloadName, prefix))
        };
    }

    static HomeCardForWorkload(card, workloadName, prefix) {
        if (!card) {
            return null;
        }

        return {
            ...card,
            title: prefix + card.title,
            onClick: this.HandlerForWorkload(card.onClick, workloadName),
            icon: { ...card.icon, name: `${workloadName}/${card.icon.name}` },
        };
    }

    static CreateExperienceToInternal(publicCreateExperience, workloadName, prefix) {
        if (!publicCreateExperience) {
            return null;
        }

        return {
            title: publicCreateExperience.title ? prefix + publicCreateExperience.title  : null,
            description: prefix + publicCreateExperience.description,
            cards: publicCreateExperience.cards?.map(card => this.CreateCardForWorkload(card, workloadName, prefix))
        };
    }

    static CreateCardForWorkload(card, workloadName, prefix) {
        if (!card) {
            return null;
        }

        return {
            ...card,
            title: prefix + card.title,
            description: prefix + card.description,
            artifactType: `${workloadName}.${card.itemType}`,
            onClick: this.HandlerForWorkload(card.onClick, workloadName),
            icon: { ...card.icon, name: `${workloadName}/${card.icon.name}` },
            icon_small: { ...card.icon_small, name: `${workloadName}/${card.icon_small.name}` }
        };
    }

    static WorkspaceSettingsToInternal(publicWorkspaceSettings, workloadName) {
        if (!publicWorkspaceSettings) {
            return null;
        }

        return {
            ...publicWorkspaceSettings,
            getWorkspaceSettings: {
                ...publicWorkspaceSettings.getWorkspaceSettings,
                extensionName: workloadName
            }
        };
    }

    static JobActionConfigToInternal(publicJobActionConfig, workloadName) {
        if (!publicJobActionConfig) {
            return null;
        }

        return {
            registeredActions: {
                ...publicJobActionConfig.registeredActions,
                detail: this.HandlerForWorkload(publicJobActionConfig.registeredActions.detail, workloadName),
                cancel: this.HandlerForWorkload(publicJobActionConfig.registeredActions.cancel, workloadName),
                retry: this.HandlerForWorkload(publicJobActionConfig.registeredActions.retry, workloadName)
            }
        };
    }

    static ItemSettingsToInternal(publicItemSettings, itemName) {
        if (!publicItemSettings) {
            return null;
        }

        return {
            recentRun: publicItemSettings.recentRun,
            schedule: {
                artifactJobType: `${itemName}.${publicItemSettings.schedule.itemJobType}`,
                refreshType: publicItemSettings.schedule.refreshType
            }
        };
    }
}

module.exports = PublicToInternalTransformer;
