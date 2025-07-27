import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { toast } from 'sonner';

interface DiagnosticIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  fix?: () => void;
}

export function MobileDiagnostics() {
  const isMobile = useIsMobile();
  const { isDark, settings } = useTheme();
  const safeSettings = settings || { theme: 'system', fontSize: 'medium', contrastMode: 'normal', reducedMotion: false };
  const { expenses = [], budgets = [], categories = [] } = useFinanceData();
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);

  useEffect(() => {
    if (!isMobile) return;

    const detectedIssues: DiagnosticIssue[] = [];

    // Check viewport issues
    if (window.innerWidth < 320) {
      detectedIssues.push({
        id: 'viewport-very-small',
        type: 'warning',
        message: 'Extremely small screen detected. Layout may be challenging.',
      });
    } else if (window.innerWidth < 360) {
      detectedIssues.push({
        id: 'viewport-small',
        type: 'info',
        message: 'Small screen detected. Interface optimized for your device.',
      });
    }

    // Check for very large font sizes that break layout
    if (safeSettings.fontSize === 'extra-large' && window.innerWidth < 400) {
      detectedIssues.push({
        id: 'font-large-mobile',
        type: 'info',
        message: 'Large font selected - some content may require scrolling.',
      });
    }

    // Check dark mode contrast issues
    if (isDark && safeSettings.contrast === 'normal') {
      detectedIssues.push({
        id: 'dark-contrast',
        type: 'info',
        message: 'Consider high contrast mode for better visibility in dark theme.',
      });
    }

    // Check data state
    if (expenses.length === 0 && budgets.length === 0) {
      detectedIssues.push({
        id: 'no-data',
        type: 'info',
        message: 'No financial data found. Add expenses to get started!',
      });
    }

    // Check if categories are broken
    if (categories.length === 0) {
      detectedIssues.push({
        id: 'no-categories',
        type: 'error',
        message: 'No expense categories found. This may cause app issues.',
        fix: () => {
          // Reset categories to default would need to be implemented
          toast.info('Please refresh the app to restore default categories');
        }
      });
    }

    // Check for potential memory issues on older devices
    if (expenses.length > 1000) {
      detectedIssues.push({
        id: 'memory-concern',
        type: 'info',
        message: 'Large expense database may slow performance on older devices.',
      });
    }

    setIssues(detectedIssues);

    // Auto-show critical issues
    const criticalIssues = detectedIssues.filter(issue => issue.type === 'error');
    if (criticalIssues.length > 0) {
      setTimeout(() => {
        criticalIssues.forEach(issue => {
          toast.error(`Mobile Issue: ${issue.message}`, {
            duration: 10000,
            action: issue.fix ? {
              label: 'Fix',
              onClick: issue.fix
            } : undefined
          });
        });
      }, 2000);
    }

  }, [isMobile, isDark, settings, expenses.length, budgets.length, categories.length]);

  // Performance monitoring
  useEffect(() => {
    if (!isMobile) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          if (entry.startTime > 3000) {
            toast.warning('Slow loading detected on mobile device', {
              description: 'Consider reducing animations or data load'
            });
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      // Performance observer not supported
    }

    return () => observer.disconnect();
  }, [isMobile]);

  // Auto-detect and fix common mobile issues
  useEffect(() => {
    if (!isMobile) return;

    // Fix zoom issues on form inputs
    const inputs = document.querySelectorAll('input[type="number"], input[type="email"], input[type="text"]');
    inputs.forEach(input => {
      const element = input as HTMLInputElement;
      if (!element.style.fontSize || parseInt(element.style.fontSize) < 16) {
        element.style.fontSize = '16px';
      }
    });

    // Fix touch target sizes
    const buttons = document.querySelectorAll('button:not(.tab-trigger)');
    buttons.forEach(button => {
      const element = button as HTMLButtonElement;
      const rect = element.getBoundingClientRect();
      if (rect.height < 44 || rect.width < 44) {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
      }
    });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  return null; // This component runs silently in the background
}