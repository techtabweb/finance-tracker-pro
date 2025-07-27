import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme, Theme, FontSize, ContrastMode } from '@/hooks/use-theme';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Type, Eye, Zap, Palette, Settings as SettingsIcon } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';

export function AccessibilitySettings() {
  const { settings, updateTheme, updateFontSize, updateContrastMode, toggleReducedMotion, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const themeIcons = {
    light: <Sun size={20} />,
    dark: <Moon size={20} />,
    system: <Monitor size={20} />
  };

  const fontSizeLabels = {
    small: 'Small (14px)',
    medium: 'Medium (16px)',
    large: 'Large (18px)',
    'extra-large': 'Extra Large (20px)'
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (!isOpen) {
    return (
      <motion.div
        className={`fixed ${isMobile ? 'bottom-28' : 'bottom-6'} right-6 z-40`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          aria-label="Open accessibility settings"
        >
          <SettingsIcon size={24} weight="duotone" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="glass-card border-2 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <Eye size={24} className="text-primary" weight="duotone" />
              <CardTitle className="text-xl">Accessibility Settings</CardTitle>
            </motion.div>
            <CardDescription>
              Customize your experience for better accessibility
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette size={16} />
                Theme Preference
              </Label>
              <Select value={settings.theme} onValueChange={(value: Theme) => updateTheme(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {themeIcons[settings.theme]}
                      <span className="capitalize">{settings.theme}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      Light Theme
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon size={16} />
                      Dark Theme
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor size={16} />
                      System Default
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Font Size */}
            <motion.div variants={itemVariants} className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Type size={16} />
                Font Size
              </Label>
              <Select value={settings.fontSize} onValueChange={(value: FontSize) => updateFontSize(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {fontSizeLabels[settings.fontSize]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fontSizeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Contrast Mode */}
            <motion.div variants={itemVariants} className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye size={16} />
                Contrast Mode
              </Label>
              <Select 
                value={settings.contrastMode} 
                onValueChange={(value: ContrastMode) => updateContrastMode(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="capitalize">{settings.contrastMode} Contrast</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Contrast</SelectItem>
                  <SelectItem value="high">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Reduced Motion */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="text-sm font-medium flex items-center gap-2">
                <Zap size={16} />
                Reduce Motion
              </Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={toggleReducedMotion}
              />
            </motion.div>

            {/* Preview */}
            <motion.div variants={itemVariants} className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="text-sm">Sample text in current settings</div>
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <div className="w-4 h-4 bg-secondary rounded"></div>
                  <div className="w-4 h-4 bg-accent rounded"></div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Apply Settings
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}