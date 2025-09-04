import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import * as en from "./locales/en";
import * as ru from "./locales/ru";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        account: en.account,
        admin: en.admin,
        cape: en.cape,
        capes: en.capes,
        config: en.config,
        configs: en.configs,
        header: en.header,
        signIn: en.signIn,
      },
      ru: {
        account: ru.account,
        admin: ru.admin,
        cape: ru.cape,
        capes: ru.capes,
        config: ru.config,
        configs: ru.configs,
        header: ru.header,
        signIn: ru.signIn,
      },
    },
  });

export default i18n;
