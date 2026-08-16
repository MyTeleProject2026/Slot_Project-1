import React, { createContext, useState, useEffect, useContext } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, translations, getTranslation } from '../utils/languages';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && Object.values(LANGUAGES).includes(saved) ? saved : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (lang) => {
    if (Object.values(LANGUAGES).includes(lang)) {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    return getTranslation(key, language);
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    translations: translations[language] || translations[DEFAULT_LANGUAGE],
    isEnglish: language === LANGUAGES.EN,
    isMyanmar: language === LANGUAGES.MM,
  };

  return (
    <>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </>
  );
};

export default LanguageContext;
