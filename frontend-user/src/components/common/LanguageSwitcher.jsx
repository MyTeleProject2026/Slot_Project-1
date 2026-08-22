import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS } from '../../utils/languages';
import { FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLabel = LANGUAGE_LABELS[language] || language;
  const currentFlag = LANGUAGE_FLAGS[language] || '🌐';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/80 backdrop-blur-sm border border-dark-700/30 hover:bg-dark-700/80 transition-all text-sm text-gray-300 hover:text-white"
        aria-label="Change language"
      >
        <span>{currentFlag}</span>
        <span className="hidden md:inline">{currentLabel}</span>
        <FaChevronDown className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-dark-700/50 py-1 z-50 overflow-hidden">
            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`flex items-center gap-3 px-4 py-2.5 w-full text-left transition-all ${
                  language === code
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'text-gray-300 hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                <span>{LANGUAGE_FLAGS[code]}</span>
                <span className="font-medium">{label}</span>
                {language === code && (
                  <span className="ml-auto text-primary-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
