import { useKV } from './use-kv';

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
  const [settings, setSettings] = useKV<ThemeSettings>('theme-settings', defaultSettings);

  const updateTheme = (theme: Theme) => {
    setSettings(current => ({ ...(current || defaultSettings), theme }));
  };

  const updateFontSize = (fontSize: FontSize) => {
    setSettings(current => ({ ...(current || defaultSettings), fontSize }));
  };

  const updateContrastMode = (contrastMode: ContrastMode) => {
    setSettings(current => ({ ...(current || defaultSettings), contrastMode }));
  };

  const toggleReducedMotion = () => {
    setSettings(current => ({ ...(current || defaultSettings), reducedMotion: !(current?.reducedMotion || false) }));
  };

  // Apply theme to document
  const applyTheme = () => {
    const root = document.documentElement;
    const currentSettings = settings || defaultSettings;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'high-contrast', 'font-small', 'font-medium', 'font-large', 'font-extra-large', 'reduced-motion');
    
    // Apply theme
    if (currentSettings.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(currentSettings.theme);
    }
    
    // Apply contrast mode
    if (currentSettings.contrastMode === 'high') {
      root.classList.add('high-contrast');
    }
    
    // Apply font size
    root.classList.add(`font-${currentSettings.fontSize}`);
    
    // Apply reduced motion
    if (currentSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    }
  };

  // Get current effective theme (resolving system preference)
  const getEffectiveTheme = (): 'light' | 'dark' => {
    const currentSettings = settings || defaultSettings;
    if (currentSettings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentSettings.theme;
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