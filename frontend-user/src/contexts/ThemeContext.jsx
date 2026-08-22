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
    applyThemeColors(theme);
  }, [theme]);

  // ✅ N999Bet Gold Theme
  const applyThemeColors = (mode) => {
    const root = document.documentElement;
    const gold = '#d4a745';
    const goldLight = '#f0d080';
    const goldDark = '#b8922f';

    if (mode === 'dark') {
      root.style.setProperty('--primary', gold);
      root.style.setProperty('--primary-light', goldLight);
      root.style.setProperty('--primary-dark', goldDark);
      root.style.setProperty('--secondary', goldLight);
      root.style.setProperty('--bg-primary', '#0a0e17');
      root.style.setProperty('--bg-secondary', '#111927');
      root.style.setProperty('--bg-card', '#161f33');
      root.style.setProperty('--bg-card-hover', '#1c2842');
      root.style.setProperty('--bg-input', '#0d1422');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e8e8f0');
      root.style.setProperty('--text-muted', '#8899bb');
      root.style.setProperty('--border-subtle', 'rgba(212, 167, 69, 0.15)');
      root.style.setProperty('--border-gold', 'rgba(212, 167, 69, 0.40)');
      root.style.setProperty('--gradient-start', gold);
      root.style.setProperty('--gradient-end', goldDark);
      root.style.setProperty('--shadow-card', '0 8px 32px rgba(0, 0, 0, 0.60)');
      root.style.setProperty('--shadow-glow', '0 0 40px rgba(212, 167, 69, 0.08)');
    } else {
      root.style.setProperty('--primary', gold);
      root.style.setProperty('--primary-light', goldLight);
      root.style.setProperty('--primary-dark', goldDark);
      root.style.setProperty('--secondary', goldLight);
      root.style.setProperty('--bg-primary', '#f5f0eb');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-card-hover', '#faf6f0');
      root.style.setProperty('--bg-input', '#f0ebe5');
      root.style.setProperty('--text-primary', '#1a120e');
      root.style.setProperty('--text-secondary', '#3a322e');
      root.style.setProperty('--text-muted', '#7a726e');
      root.style.setProperty('--border-subtle', 'rgba(212, 167, 69, 0.20)');
      root.style.setProperty('--border-gold', 'rgba(212, 167, 69, 0.50)');
      root.style.setProperty('--gradient-start', gold);
      root.style.setProperty('--gradient-end', goldDark);
      root.style.setProperty('--shadow-card', '0 8px 32px rgba(0, 0, 0, 0.10)');
      root.style.setProperty('--shadow-glow', '0 0 40px rgba(212, 167, 69, 0.08)');
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
