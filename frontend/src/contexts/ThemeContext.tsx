import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeGradients {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeData {
  colors: ThemeColors;
  gradients: ThemeGradients;
}

interface ThemeContextType {
  theme: ThemeData;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const lightTheme: ThemeData = {
  colors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    secondary: 'linear-gradient(135deg, #10B981, #059669)',
    accent: 'linear-gradient(135deg, #F59E0B, #D97706)'
  }
};

const darkTheme: ThemeData = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#34D399',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    background: '#0F172A',
    surface: '#1E293B',
    cardBg: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#475569',
    shadow: 'rgba(0, 0, 0, 0.3)'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    secondary: 'linear-gradient(135deg, #34D399, #10B981)',
    accent: 'linear-gradient(135deg, #FBBF24, #F59E0B)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
  const { isAuthenticated, user } = useAuthStore();
  const { preferences, updateTheme: updateUserTheme, loading: preferencesLoading } = useUserPreferences();
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // For immediate theme application on page load, check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      console.log('Loading theme from localStorage:', storedTheme);
      return storedTheme === 'dark';
    }
    
    // Default to system preference
    if (typeof window !== 'undefined') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('Using system theme preference:', systemDark ? 'dark' : 'light');
      return systemDark;
    }
    return false;
  });

  const [themeInitialized, setThemeInitialized] = useState(false);

  const theme: ThemeData = isDarkMode ? darkTheme : lightTheme;

  // Handle theme loading from database when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Wait for preferences to finish loading
      if (!preferencesLoading) {
        if (preferences && preferences.theme && !themeInitialized) {
          const dbTheme = preferences.theme === 'dark';
          console.log('Loading theme from database:', preferences.theme);
          setIsDarkMode(dbTheme);
          // Store in localStorage for faster loading next time
          localStorage.setItem('theme', preferences.theme);
          setThemeInitialized(true);
        } else if (!preferences?.theme && !themeInitialized) {
          // No theme preference in database, use current theme and save it
          console.log('No theme in database, using current theme:', isDarkMode ? 'dark' : 'light');
          const currentTheme = isDarkMode ? 'dark' : 'light';
          localStorage.setItem('theme', currentTheme);
          // Save to database
          if (updateUserTheme) {
            updateUserTheme(currentTheme).catch(console.error);
          }
          setThemeInitialized(true);
        }
      }
    } else {
      // User is not authenticated, use localStorage or system preference
      if (!themeInitialized) {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
          console.log('Using stored theme for non-authenticated user:', storedTheme);
          setIsDarkMode(storedTheme === 'dark');
        } else {
          const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          console.log('Using system preference for non-authenticated user:', systemDarkMode ? 'dark' : 'light');
          setIsDarkMode(systemDarkMode);
          localStorage.setItem('theme', systemDarkMode ? 'dark' : 'light');
        }
        setThemeInitialized(true);
      }
    }
  }, [isAuthenticated, user?.id, preferences, preferencesLoading, updateUserTheme, themeInitialized]);

  // Reset theme initialization when user changes
  useEffect(() => {
    setThemeInitialized(false);
  }, [user?.id, isAuthenticated]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    console.log('Setting theme to:', newTheme);
    setIsDarkMode(newTheme === 'dark');
    
    // Always store in localStorage for immediate persistence
    localStorage.setItem('theme', newTheme);
    
    if (isAuthenticated && updateUserTheme) {
      try {
        await updateUserTheme(newTheme);
        console.log('Theme saved to database:', newTheme);
      } catch (error) {
        console.error('Failed to update theme in database:', error);
        // Theme is still saved in localStorage as fallback
      }
    }
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Update HTML class for Tailwind CSS dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const value: ThemeContextType = {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
