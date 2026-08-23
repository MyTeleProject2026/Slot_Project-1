import React, { createContext, useState, useEffect, useContext } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, translations, getTranslation } from '../utils/languages';
import { getCurrentCountry } from '../utils/constants';

const LanguageContext = createContext();
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && Object.values(LANGUAGES).includes(saved) ? saved : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === LANGUAGES.MM ? 'my' : 'en';
    document.documentElement.dataset.language = language;
  }, [language]);

  const changeLanguage = (lang) => {
    if (Object.values(LANGUAGES).includes(lang)) setLanguage(lang);
  };

  const t = (key) => {
    const raw = getTranslation(key, language);
    const country = getCurrentCountry();
    const currency = country?.currency || 'MMK';
    const symbol = country?.currencySymbol || 'K';
    // Legacy translation keys contained THB. Currency is now always supplied
    // by the active club/country configuration, so the old literal can never
    // leak into the Myanmar deployment.
    return String(raw)
      .replaceAll('THB', currency)
      .replaceAll('฿', symbol)
      .replaceAll('{{currency}}', currency)
      .replaceAll('{{currencySymbol}}', symbol);
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    translations: translations[language] || translations[DEFAULT_LANGUAGE],
    isEnglish: language === LANGUAGES.EN,
    isMyanmar: language === LANGUAGES.MM,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageContext;
