import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en-US',
        supportedLngs: ['en-US', 'es', 'he'],
        debug: false,
        useSuspense: false,
        backend: {
            loadPath: "/workloadAssets/locales/{{lng}}/translation.json"
        }

    });

export default i18n;