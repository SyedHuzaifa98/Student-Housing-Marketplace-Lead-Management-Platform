import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false, size = 'md' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  };

  const iconSizeClass = iconSizes[size] || 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700/80 shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      <div className="flex items-center justify-center">
        {isDark ? (
          <Sun className={`${iconSizeClass} transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400`} />
        ) : (
          <Moon className={`${iconSizeClass} transition-transform duration-300 rotate-0 hover:-rotate-12 text-slate-600`} />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
