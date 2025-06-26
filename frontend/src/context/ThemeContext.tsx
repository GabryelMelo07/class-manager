import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  changeTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'theme'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  const isValidTheme = (theme: string): theme is Theme => {
    return ['light', 'dark', 'system'].includes(theme);
  };

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      
      if (savedTheme && isValidTheme(savedTheme)) {
        setTheme(savedTheme);
        setResolvedTheme(resolveTheme(savedTheme));
      } else {
        setTheme(defaultTheme);
        setResolvedTheme(resolveTheme(defaultTheme));
      }
    } catch (error) {
      console.warn('localStorage não disponível, usando tema padrão:', error);
      setTheme(defaultTheme);
      setResolvedTheme(resolveTheme(defaultTheme));
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent): void => {
      if (theme === 'system') {
        setResolvedTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores mais antigos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const changeTheme = (newTheme: Theme): void => {
    setTheme(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Não foi possível salvar o tema no localStorage:', error);
    }
  };

  const toggleTheme = (): void => {
    const newTheme: Theme = resolvedTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    changeTheme,
    toggleTheme,
    isSystemTheme: theme === 'system'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
