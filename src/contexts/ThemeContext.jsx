import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dev-theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      const selectedTheme =
        theme === 'system'
          ? (systemPreference.matches ? 'dark' : 'light')
          : theme;

      root.setAttribute('data-theme', selectedTheme);
    }

    applyTheme();

    localStorage.setItem('dev-theme', theme);

    systemPreference.addEventListener('change', applyTheme);

    return () => {
      systemPreference.removeEventListener('change', applyTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}