import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [systemDark, setSystemDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [particles, setParticles] = useState(false);

  useEffect(() => {
    const systemPreference = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    function updateSystemTheme() {
      setSystemDark(systemPreference.matches);
    }

    systemPreference.addEventListener('change', updateSystemTheme);

    return () => {
      systemPreference.removeEventListener('change', updateSystemTheme);
    };
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemDark);

  function handleToggle() {
    setParticles(true);
    setTheme(isDark ? 'light' : 'dark');

    setTimeout(() => {
      setParticles(false);
    }, 800);
  }

  return (
    <div className="cinematic-theme-control">

      <motion.button
        type="button"
        className={`cinematic-switch ${isDark ? 'dark' : 'light'}`}
        onClick={handleToggle}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        role="switch"
        aria-checked={isDark}
      >

        <div className="switch-icons">
          <Sun size={15} />
          <Moon size={15} />
        </div>

        <motion.div
          className="switch-thumb"
          animate={{ x: isDark ? 36 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          {isDark ? (
            <Moon size={17} />
          ) : (
            <Sun size={17} />
          )}
        </motion.div>

        {particles && (
          <motion.div
            className="switch-particles"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        )}

      </motion.button>

      <button
        type="button"
        className={`system-theme-button ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title="Use system theme"
      >
        Auto
      </button>

    </div>
  );
}

export default ThemeToggle;