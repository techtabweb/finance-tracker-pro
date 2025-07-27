import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { CheckCircle, XCircle, Sun, Moon, Monitor } from '@phosphor-icons/react';

export function ThemeTest() {
  const { settings, updateTheme, isDark, getEffectiveTheme } = useTheme();
  const safeSettings = settings || { theme: 'system', fontSize: 'medium', contrastMode: 'normal', reducedMotion: false };

  useEffect(() => {
    console.log('Current theme safeSettings:', safeSettings);
    console.log('Is dark mode:', isDark);
    console.log('Effective theme:', getEffectiveTheme());
  }, [safeSettings, isDark, getEffectiveTheme]);

  const testItems = [
    { name: 'Dark Mode Classes', status: document.documentElement.classList.contains('dark') },
    { name: 'Font Size Classes', status: document.documentElement.classList.contains(`font-${safeSettings.fontSize}`) },
    { name: 'Contrast Classes', status: safeSettings.contrastMode === 'high' ? document.documentElement.classList.contains('high-contrast') : true },
    { name: 'Motion Classes', status: safeSettings.reducedMotion ? document.documentElement.classList.contains('reduced-motion') : true },
  ];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Theme System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <h3 className="font-medium">Current Settings</h3>
            <div className="text-sm space-y-1">
              <p>Theme: {safeSettings.theme} (Effective: {getEffectiveTheme()})</p>
              <p>Font Size: {safeSettings.fontSize}</p>
              <p>Contrast: {safeSettings.contrastMode}</p>
              <p>Reduced Motion: {safeSettings.reducedMotion ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-medium">System Status</h3>
            {testItems.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                {item.status ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <h3 className="font-medium">Theme Test Buttons</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun size={16} />
                Light
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon size={16} />
                Dark
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateTheme('system')}
                className="flex items-center gap-2"
              >
                <Monitor size={16} />
                System
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium">Visual Test</h4>
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-primary rounded"></div>
              <div className="w-6 h-6 bg-secondary rounded"></div>
              <div className="w-6 h-6 bg-accent rounded"></div>
              <div className="w-6 h-6 bg-muted rounded"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              This text should adapt to the current theme
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}