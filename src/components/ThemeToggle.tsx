import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ThemeToggle({ size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`flex items-center gap-2 bg-bg-elevated border border-border-default rounded-full cursor-pointer text-text-secondary hover:border-orion-blue hover:text-text-primary ${
        size === 'sm' ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
      }`}
      style={{ transition: 'all var(--transition-base)' }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark
          ? <Sun size={size === 'sm' ? 14 : 16} />
          : <Moon size={size === 'sm' ? 14 : 16} />
        }
      </motion.div>
      {showLabel && (
        <span className="font-body text-[13px] font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
