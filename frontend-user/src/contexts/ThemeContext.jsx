// frontend-user/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Apply custom CSS variables for the theme
    applyThemeColors(theme);
  }, [theme]);

  // Apply theme colors matching your logo (orange/gold)
  const applyThemeColors = (mode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.style.setProperty('--primary', '#FF6B00');
      root.style.setProperty('--primary-light', '#FF8C38');
      root.style.setProperty('--primary-dark', '#CC5500');
      root.style.setProperty('--secondary', '#FFAA00');
      root.style.setProperty('--bg-primary', '#0A0A0F');
      root.style.setProperty('--bg-secondary', '#1A1A2E');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#A0A0B0');
    } else {
      root.style.setProperty('--primary', '#FF6B00');
      root.style.setProperty('--primary-light', '#FF8C38');
      root.style.setProperty('--primary-dark', '#CC5500');
      root.style.setProperty('--secondary', '#FFAA00');
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F5F5F5');
      root.style.setProperty('--text-primary', '#1A1A2E');
      root.style.setProperty('--text-secondary', '#4A4A5A');
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isMobile, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
