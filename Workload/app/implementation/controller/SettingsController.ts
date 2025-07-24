import { ItemLikeV2, OpenItemSettingsConfig, OpenUIResult, WorkloadClientAPI, WorkloadSettings } from "@ms-fabric/workload-client";

// --- Settings API

/**
 * Calls the 'settings.get' function from the WorkloadClientAPI to retrieve the current workload settings.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<WorkloadSettings>} - The retrieved workload settings.
 */
export async function callSettingsGet(workloadClient: WorkloadClientAPI): Promise<WorkloadSettings> {
    return await workloadClient.settings.get();
}

export async function callLanguageGet(workloadClient: WorkloadClientAPI): Promise<string> {
    const settings = await callSettingsGet(workloadClient);
    return settings.currentLanguageLocale;
}

export function settingsToView(settings: WorkloadSettings): string {
    return [`Instance ID: ${settings.instanceId}`, `Host Origin: ${settings.workloadHostOrigin}`, `Current Language Locale: ${settings.currentLanguageLocale}`, `API URI: ${settings.apiUri}`].join('\r\n');
}



/**
 * Calls the 'settings.onChange' function from the WorkloadClientAPI to register a callback for settings change events.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callSettingsOnChange(
    workloadClient: WorkloadClientAPI, 
    changeLang: (language: string) => void) {
    // Define a callback function to be invoked when workload settings change
    const callback: (settings: WorkloadSettings) => void =
        (ws: WorkloadSettings): void => {
            {
                // Since this callback is invoked multiple times, log a message to the console
                console.log("Settings On Change invoked");
                console.log("CurrentLanguage", ws.currentLanguageLocale);
                changeLang(ws.currentLanguageLocale);
            };
        };
    await workloadClient.settings.onChange(callback);
}

/**
 * Calls the 'itemSettings.open' function from the WorkloadClientAPI, opening the settings pane shared UI component for the item.
 *
 * @param {ItemLikeV2} item - The item for which we want to show the settings pane.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} selectedSettingId - The ID of the tab we want to show. If no ID is passed, the item settings panel will open in the 'About' Tab.
 * @returns {OpenUIResult} - The result of the UI operation.
 */
export async function callOpenSettings(
    workloadClient: WorkloadClientAPI,
    item: ItemLikeV2,
    selectedSettingId?: string): Promise<OpenUIResult> {

    const config: OpenItemSettingsConfig = {
        item,
        selectedSettingId
    };

    console.log(`Call open item settings. request: ${config}`);

    try {
        const result: OpenUIResult = await workloadClient.itemSettings.open(config)
        console.log(`OpenItemSettings: ${result}`);
        return result;
    }
    catch (exception) {
        console.error(`Failed to open settings for item: ${item}`);
        console.log(exception);
    }

    return null;
}