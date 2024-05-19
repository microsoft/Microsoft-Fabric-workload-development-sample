import { bootstrap } from '@ms-fabric/workload-client';

/** This is used for authentication API as a redirect URI.
 * Delete this code if you do not plan on using authentication API.
 * You can change the redirectUriPath to whatever suits you.
 */
const redirectUriPath = '/close';
const url = new URL(window.location.href);
if (url.pathname?.startsWith(redirectUriPath)) {
    window.close();
}

console.log('****Runtime: Environment Variables****');
console.log('process.env.WORKLOAD_NAME: ' + process.env.WORKLOAD_NAME);
console.log('process.env.WORKLOAD_BE_URL: ' + process.env.WORKLOAD_BE_URL);
console.log('**************************************');

bootstrap({
    initializeWorker: (params) =>
        import('./index.worker').then(({ initialize }) => initialize(params)),
    initializeUI: (params) =>
        import('./index.ui').then(({ initialize }) => initialize(params)),
});
