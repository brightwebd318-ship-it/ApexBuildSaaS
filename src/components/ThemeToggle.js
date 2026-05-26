import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark'); // dark mode is the default SaaS style

  useEffect(() => {
    // Check local storage or default class on body
    const savedTheme = localStorage.getItem('cms_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-white', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-white', 'text-slate-900');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('cms_theme', nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-white', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-white', 'text-slate-900');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white shadow-xl hover:scale-105 transition-all focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5.5 w-5.5 text-amber-400" />
      ) : (
        <Moon className="h-5.5 w-5.5 text-indigo-400" />
      )}
    </button>
  );
}
