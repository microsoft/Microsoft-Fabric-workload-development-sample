import { ThemeConfiguration, Tokens, WorkloadClientAPI } from "@ms-fabric/workload-client";


/**
 * Calls the 'theme.get' function from the WorkloadClientAPI to retrieve the current Fabric Theme configuration.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<ThemeConfiguration>} - The retrieved theme configuration.
 */
export async function callThemeGet(workloadClient: WorkloadClientAPI): Promise<ThemeConfiguration> {
    return await workloadClient.theme.get();
}

function tokensToFormattedString(tokens: Tokens): string {
    return Object.entries(tokens)
        .map(([tokenName, tokenValue]) => `${tokenName}: ${tokenValue}`)
        .join(',\r\n');
}

export function themeToView(theme: ThemeConfiguration): string {
    return `Theme name: ${theme.name},\r\n Tokens: ${tokensToFormattedString(theme.tokens)}`;
}


/**
 * Calls the 'theme.onChange' function from the WorkloadClientAPI to register a callback for theme change events.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callThemeOnChange(workloadClient: WorkloadClientAPI) {
    // Define a callback function to be invoked when the theme changes
    const callback: (theme: ThemeConfiguration) => void =
        (_: ThemeConfiguration): void => {
            {
                // Since this callback is invoked multiple times, log a message to the console
                console.log("Theme On Change invoked");
            };
        };
    await workloadClient.theme.onChange(callback);
}