import { useKV } from '@github/spark/hooks';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastMode = 'normal' | 'high';

interface ThemeSettings {
  theme: Theme;
  fontSize: FontSize;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
}

const defaultSettings: ThemeSettings = {
  theme: 'system',
  fontSize: 'medium',
  contrastMode: 'normal',
  reducedMotion: false,
};

export function useTheme() {
  const [settings, setSettings] = useKV('theme-settings', defaultSettings);

  const updateTheme = (theme: Theme) => {
    setSettings(current => ({ ...current, theme }));
  };

  const updateFontSize = (fontSize: FontSize) => {
    setSettings(current => ({ ...current, fontSize }));
  };

  const updateContrastMode = (contrastMode: ContrastMode) => {
    setSettings(current => ({ ...current, contrastMode }));
  };

  const toggleReducedMotion = () => {
    setSettings(current => ({ ...current, reducedMotion: !current.reducedMotion }));
  };

  // Apply theme to document
  const applyTheme = () => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'high-contrast', 'font-small', 'font-medium', 'font-large', 'font-extra-large', 'reduced-motion');
    
    // Apply theme
    if (settings.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(settings.theme);
    }
    
    // Apply contrast mode
    if (settings.contrastMode === 'high') {
      root.classList.add('high-contrast');
    }
    
    // Apply font size
    root.classList.add(`font-${settings.fontSize}`);
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    }
  };

  // Get current effective theme (resolving system preference)
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.theme;
  };

  return {
    settings,
    updateTheme,
    updateFontSize,
    updateContrastMode,
    toggleReducedMotion,
    applyTheme,
    getEffectiveTheme,
    isDark: getEffectiveTheme() === 'dark',
  };
}