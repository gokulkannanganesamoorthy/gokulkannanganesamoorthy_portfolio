import React, { useEffect, useState } from 'react';
import MagneticButton from './MagneticButton';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 999,
      mixBlendMode: 'difference'
    }}>
      <MagneticButton 
        onClick={toggleTheme}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      >
        {theme === 'light' ? 'Dark' : 'Light'}
      </MagneticButton>
    </div>
  );
};

export default ThemeToggle;
