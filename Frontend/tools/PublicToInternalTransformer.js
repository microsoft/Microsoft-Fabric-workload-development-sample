const PublicProduct = require('./Public/PublicProduct');
const PublicItem = require('./Public/PublicItem');
const InternalProduct = require('./Internal/InternalProduct');
const InternalItem = require('./Internal/InternalItem');

class PublicToInternalTransformer {
    static toInternal(publicSchema, workloadName, productName = "") {
        if (!publicSchema) {
            return null;
        }

        if (publicSchema instanceof PublicProduct) {
            return this.ProductToInternal(publicSchema, workloadName);
        } else if (publicSchema instanceof PublicItem) {
            return this.ItemToInternal(publicSchema, workloadName, productName);
        }
    }

    static ProductToInternal(publicSchema, workloadName) {
        const internalSchema = new InternalProduct(
            `${workloadName}.${publicSchema.name}`,
            publicSchema.displayName,
            publicSchema.fullDisplayName,
            publicSchema.description,
            `${workloadName}/${publicSchema.favicon}`,
            { name: `${workloadName}/${publicSchema.icon.name}` },
            this.CreateExperienceToInternal(publicSchema.createExperience, workloadName),
            this.WorkspaceSettingsToInternal(publicSchema.workspaceSettings, workloadName),
            this.ProductDetailToInternal(publicSchema.productDetail, workloadName),
            publicSchema.compatibleItemTypes,
            this.HomePageToInternal(publicSchema.homePage, workloadName),       
        );

        return internalSchema;
    }


    static ItemToInternal(publicSchema, workloadName, productName) {
        const itemName = `${workloadName}.${publicSchema.name}`;
        const internalItemSchema = new InternalItem(
            itemName,
            [`${workloadName}.${productName}`],
            publicSchema.displayName,
            publicSchema.displayNamePlural,
            { ...publicSchema.editor, extension: workloadName },
            { ...publicSchema.icon, name: `${workloadName}/${publicSchema.icon.name}` },
            { ...publicSchema.activeIcon, name: `${workloadName}/${publicSchema.activeIcon.name}` },
            publicSchema.contextMenuItems?.map(mi => this.MenuItemToInternal(mi, workloadName)),
            publicSchema.quickActionItems?.map(mi => this.MenuItemToInternal(mi, workloadName)),
            publicSchema.supportedInMonitoringHub,
            this.JobActionConfigToInternal(publicSchema.itemJobActionConfig, workloadName),
            this.ItemSettingsToInternal(publicSchema.itemSettings, itemName),
            publicSchema.itemJobTypes
        );

        return internalItemSchema;
    }

    static MenuItemToInternal(publicSchema, workloadName) {
        if (!publicSchema || !publicSchema.handler || !publicSchema.icon) {
            return publicSchema;
        }

        return {
            ...publicSchema,
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

    static HomePageToInternal(publicHomePage, workloadName) {
        if (!publicHomePage) {
            return null;
        }

        return {
            learningMaterials: publicHomePage.learningMaterials.map(lm => this.LearningMaterialForWorkload(lm, workloadName)),
            recommendedArtifactTypes: publicHomePage.recommendedItemTypes.map(it => `${workloadName}.${it}`),
            newSection: this.NewSectionToInternal(publicHomePage.newSection, workloadName)
        };
    }

    static ProductDetailToInternal(publicProductDetail, workloadName) {
        if (!publicProductDetail) {
            return null;
        }

        return {
            ...publicProductDetail,
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

    static LearningMaterialForWorkload(material, workloadName) {
        if (!material) {
            return null;
        }

        return {
            ...material,
            onClick: this.HandlerForWorkload(material.onClick, workloadName),
            image: `${workloadName}/${material.image}`
        };
    }

    static NewSectionToInternal(publicNewSection, workloadName) {
        if (!publicNewSection) {
            return null;
        }

        return {
            customActions: publicNewSection.customActions?.map(card => this.HomeCardForWorkload(card, workloadName, false))
        };
    }

    static HomeCardForWorkload(card, workloadName) {
        if (!card) {
            return null;
        }

        return {
            ...card,
            onClick: this.HandlerForWorkload(card.onClick, workloadName),
            icon: { ...card.icon, name: `${workloadName}/${card.icon.name}` },
        };
    }

    static CreateExperienceToInternal(publicCreateExperience, workloadName) {
        if (!publicCreateExperience) {
            return null;
        }

        return {
            description: publicCreateExperience.description,
            cards: publicCreateExperience.cards?.map(card => this.CreateCardForWorkload(card, workloadName))
        };
    }

    static CreateCardForWorkload(card, workloadName) {
        if (!card) {
            return null;
        }

        return {
            ...card,
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