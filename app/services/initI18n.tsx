import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { resources } from "../assets/translations";

export const initI18n = () => {
    // Initialize i18next
    i18n.use(initReactI18next).init({
      resources,
      lng: Localization.locale,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
    
}
export default initI18n;