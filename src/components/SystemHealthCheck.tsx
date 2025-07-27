import { useEffect, useState } from 'react';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, CheckCircle, Warning, WarningCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthStatus {
  overall: 'excellent' | 'good' | 'warning' | 'critical';
  issues: string[];
  suggestions: string[];
}

export function SystemHealthCheck() {
  const { expenses = [], budgets = [], categories = [] } = useFinanceData();
  const { isDark, settings } = useTheme();
  const safeSettings = settings || { theme: 'system', fontSize: 'medium', contrastMode: 'normal', reducedMotion: false };
  const isMobile = useIsMobile();
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<HealthStatus | null>(null);

  const checkSystemHealth = (): HealthStatus => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Only check for critical issues that actually break functionality
    // Don't warn about empty categories since we have defaults that auto-load
    
    // Check if theme variables are loaded properly
    const hasThemeVars = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() !== '';
    if (!hasThemeVars) {
      issues.push('Theme system not properly loaded');
      suggestions.push('Try refreshing the page');
    }

    // Only warn for extremely small screens that break UI (below 240px)
    if (isMobile && window.innerWidth < 240) {
      issues.push('Screen too small for optimal experience');
      suggestions.push('Consider using in landscape mode');
    }

    // Check if Gemini API is available (just informational, not an issue)
    const hasGeminiApi = typeof window !== 'undefined' && window.spark?.llm;
    if (!hasGeminiApi) {
      // This is not an issue, just use basic mode
      // suggestions.push('AI features running in basic mode');
    }

    // Determine overall status - only show as warning/critical for real issues
    let overall: HealthStatus['overall'] = 'excellent';
    if (issues.length > 0) {
      overall = issues.length > 2 ? 'critical' : 'warning';
    }

    return { overall, issues, suggestions };
  };

  // Quick health check function for console
  const quickHealthCheck = () => {
    const health = checkSystemHealth();
    
    console.group('🏥 Finance Tracker Health Check');
    console.log(`📊 Overall Status: ${health.overall.toUpperCase()}`);
    
    if (health.issues.length > 0) {
      console.log('⚠️ Issues Found:');
      health.issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
      console.log('✅ No critical issues found');
    }
    
    if (health.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      health.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
    }
    
    console.log('\n📈 System Stats:');
    console.log(`  • Expenses: ${expenses.length}`);
    console.log(`  • Budgets: ${budgets.length}`);
    console.log(`  • Categories: ${categories.length}`);
    console.log(`  • Theme: ${safeSettings.theme} (${isDark ? 'dark' : 'light'})`);
    console.log(`  • Device: ${isMobile ? 'mobile' : 'desktop'} (${window.innerWidth}px)`);
    console.log(`  • AI Chat: ${typeof window.spark?.llm === 'function' ? 'Available' : 'Basic mode'}`);
    
    console.groupEnd();
    
    return health;
  };

  // Check health and update state
  useEffect(() => {
    const health = checkSystemHealth();
    setLastHealthCheck(health);
    
    // Only show panel automatically if there are critical issues that need attention
    if (health.issues.length > 0 && health.overall === 'critical') {
      setShowHealthPanel(true);
    }
  }, [expenses.length, budgets.length, categories.length, isDark, safeSettings.theme, isMobile]);

  // Expose to global scope
  useEffect(() => {
    (window as any).checkFinanceTrackerHealth = () => {
      const health = quickHealthCheck();
      setLastHealthCheck(health);
      setShowHealthPanel(true);
      return health;
    };
  }, [expenses.length, budgets.length, categories.length, isDark, safeSettings.theme, isMobile]);

  if (!lastHealthCheck) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-500" weight="fill" />;
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-500" weight="fill" />;
      case 'critical':
        return <WarningCircle className="w-5 h-5 text-red-500" weight="fill" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    const { overall, issues, suggestions } = lastHealthCheck;
    if (issues.length === 0 && suggestions.length === 0) {
      return "System running perfectly";
    }
    if (issues.length > 0) {
      return `${issues.length} issue${issues.length === 1 ? '' : 's'} found`;
    }
    return `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'} available`;
  };

  // Only show health indicator if there are critical issues that need attention
  const shouldShowIndicator = lastHealthCheck.issues.length > 0 && lastHealthCheck.overall !== 'excellent';

  return (
    <>
      {/* Health Status Indicator - Only show when needed */}
      {shouldShowIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 right-4 z-50"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHealthPanel(!showHealthPanel)}
            className="bg-card/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {getStatusIcon(lastHealthCheck.overall)}
            <span className="ml-2 text-sm font-medium">
              System Check: {getStatusMessage()}
            </span>
          </Button>
        </motion.div>
      )}

      {/* Health Panel */}
      <AnimatePresence>
        {showHealthPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHealthPanel(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="p-6 bg-card/95 backdrop-blur-md border shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(lastHealthCheck.overall)}
                    <h3 className="font-semibold">System Health Check</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHealthPanel(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {lastHealthCheck.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Issues Found:</h4>
                      <ul className="space-y-1">
                        {lastHealthCheck.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <WarningCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lastHealthCheck.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions:</h4>
                      <ul className="space-y-1">
                        {lastHealthCheck.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lastHealthCheck.issues.length === 0 && lastHealthCheck.suggestions.length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" weight="fill" />
                      <p className="text-green-600 dark:text-green-400 font-medium">All systems operational!</p>
                      <p className="text-sm text-muted-foreground mt-1">Your Finance Tracker is running smoothly.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const health = checkSystemHealth();
                      setLastHealthCheck(health);
                    }}
                  >
                    Refresh Check
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowHealthPanel(false)}
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}