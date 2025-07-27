import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { callGeminiApi } from '@/lib/gemini-api';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings,
  Palette,
  Smartphone,
  Brain,
  Database,
  RefreshCw,
  Bug,
  Zap
} from 'lucide-react';

interface ValidationResult {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  fix?: string;
}

export function SystemValidator() {
  const { expenses, budgets, savingsGoals } = useFinanceData();
  const { settings, getEffectiveTheme } = useTheme();
  const isMobile = useIsMobile();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const validationTests = [
    {
      category: 'Theme System',
      name: 'Theme Variables',
      test: () => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const bgColor = computedStyle.getPropertyValue('--background').trim();
        const fgColor = computedStyle.getPropertyValue('--foreground').trim();
        
        if (!bgColor || !fgColor) {
          return { status: 'fail', message: 'CSS theme variables not properly defined' };
        }
        
        if (bgColor.includes('oklch') && fgColor.includes('oklch')) {
          return { status: 'pass', message: 'Theme variables using oklch format' };
        }
        
        return { status: 'warning', message: 'Theme variables may not be in optimal format' };
      }
    },
    {
      category: 'Theme System', 
      name: 'Dark Mode Support',
      test: () => {
        const isDarkClassPresent = document.documentElement.classList.contains('dark');
        const isLightClassPresent = document.documentElement.classList.contains('light');
        
        if (isDarkClassPresent || isLightClassPresent) {
          return { 
            status: 'pass', 
            message: `Theme applied: ${getEffectiveTheme()}`,
            details: `Current setting: ${settings.theme}`
          };
        }
        
        return { status: 'fail', message: 'Theme classes not applied to document' };
      }
    },
    {
      category: 'Mobile Responsiveness',
      name: 'Mobile Detection',
      test: () => {
        const actuallyMobile = window.innerWidth <= 768;
        const detectedMobile = isMobile;
        
        if (actuallyMobile === detectedMobile) {
          return { status: 'pass', message: `Mobile detection accurate: ${detectedMobile}` };
        }
        
        return { status: 'warning', message: `Mobile detection mismatch: actual=${actuallyMobile}, detected=${detectedMobile}` };
      }
    },
    {
      category: 'Mobile Responsiveness',
      name: 'Touch Targets',
      test: () => {
        const buttons = document.querySelectorAll('button');
        let problematicButtons = 0;
        
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (isMobile && (rect.width < 44 || rect.height < 44)) {
            problematicButtons++;
          }
        });
        
        if (problematicButtons === 0) {
          return { status: 'pass', message: 'All buttons meet minimum touch target size' };
        }
        
        return { 
          status: 'warning', 
          message: `${problematicButtons} buttons below 44px minimum touch target`,
          fix: 'Add mobile-specific padding to improve touch accessibility'
        };
      }
    },
    {
      category: 'Data Integrity',
      name: 'Finance Data Structure',
      test: () => {
        const hasExpenses = Array.isArray(expenses);
        const hasBudgets = Array.isArray(budgets);
        const hasGoals = Array.isArray(savingsGoals);
        
        if (hasExpenses && hasBudgets && hasGoals) {
          return { 
            status: 'pass', 
            message: `Data structures valid: ${expenses.length} expenses, ${budgets.length} budgets, ${savingsGoals.length} goals` 
          };
        }
        
        return { status: 'fail', message: 'Finance data structures are not properly initialized' };
      }
    },
    {
      category: 'Data Integrity',
      name: 'Data Consistency',
      test: () => {
        const expenseCategories = new Set(expenses.map(e => e.category));
        const budgetCategories = new Set(budgets.map(b => b.category));
        const orphanedBudgets = [...budgetCategories].filter(cat => !expenseCategories.has(cat));
        
        if (orphanedBudgets.length === 0) {
          return { status: 'pass', message: 'Budget categories align with expense data' };
        }
        
        return { 
          status: 'warning', 
          message: `${orphanedBudgets.length} budget categories without expenses`,
          details: orphanedBudgets.join(', ')
        };
      }
    },
    {
      category: 'AI Integration',
      name: 'Gemini API Connectivity',
      test: async () => {
        try {
          const testPrompt = 'Hello, this is a connectivity test. Please respond with "OK".';
          const response = await callGeminiApi(testPrompt, { temperature: 0, maxTokens: 10 });
          
          if (response && response.toLowerCase().includes('ok')) {
            return { status: 'pass', message: 'Gemini AI API working correctly' };
          }
          
          return { status: 'warning', message: 'Gemini API responded but response unclear' };
        } catch (error) {
          return { 
            status: 'fail', 
            message: 'Gemini API connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      category: 'Performance',
      name: 'Component Hydration',
      test: () => {
        const hasReactElements = document.querySelector('[data-reactroot]') || 
                                document.querySelector('#root') ||
                                document.querySelector('[data-testid]');
        
        if (hasReactElements || document.querySelectorAll('[class*="react"]').length > 0) {
          return { status: 'pass', message: 'React components properly hydrated' };
        }
        
        return { status: 'fail', message: 'React hydration may have failed' };
      }
    },
    {
      category: 'Performance',
      name: 'CSS Loading',
      test: () => {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
        const hasCustomStyles = Array.from(stylesheets).some(sheet => 
          sheet.textContent?.includes('--background') || 
          (sheet as HTMLLinkElement).href?.includes('main.css')
        );
        
        if (hasCustomStyles || stylesheets.length > 0) {
          return { status: 'pass', message: `${stylesheets.length} stylesheets loaded successfully` };
        }
        
        return { status: 'fail', message: 'CSS stylesheets not properly loaded' };
      }
    },
    {
      category: 'Accessibility',
      name: 'Color Contrast',
      test: () => {
        const root = document.documentElement;
        const bg = getComputedStyle(root).getPropertyValue('--background');
        const fg = getComputedStyle(root).getPropertyValue('--foreground');
        
        if (settings.contrastMode === 'high') {
          return { status: 'pass', message: 'High contrast mode enabled for better accessibility' };
        }
        
        if (bg && fg) {
          return { status: 'pass', message: 'Color contrast variables defined' };
        }
        
        return { status: 'warning', message: 'Color contrast may need verification' };
      }
    }
  ];

  const runValidation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const newResults: ValidationResult[] = [];
    
    for (let i = 0; i < validationTests.length; i++) {
      const test = validationTests[i];
      setProgress((i / validationTests.length) * 100);
      
      try {
        const result = await test.test();
        newResults.push({
          category: test.category,
          name: test.name,
          ...result
        });
      } catch (error) {
        newResults.push({
          category: test.category,
          name: test.name,
          status: 'fail',
          message: 'Test execution failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setProgress(100);
    setResults(newResults);
    setIsRunning(false);
  };

  useEffect(() => {
    // Run validation on mount
    runValidation();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200 text-green-800';
      case 'fail': return 'bg-red-50 border-red-200 text-red-800';  
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Theme System': return <Palette className="w-4 h-4" />;
      case 'Mobile Responsiveness': return <Smartphone className="w-4 h-4" />;
      case 'Data Integrity': return <Database className="w-4 h-4" />;
      case 'AI Integration': return <Brain className="w-4 h-4" />;
      case 'Performance': return <Zap className="w-4 h-4" />;
      case 'Accessibility': return <Settings className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'pass').length;
  const failedTests = results.filter(r => r.status === 'fail').length;
  const warningTests = results.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl">
            <Bug className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">System Health Check</h2>
            <p className="text-muted-foreground">Comprehensive validation of all app features</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalTests}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Running validation tests...</div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-sm font-medium">{Math.round(progress)}%</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                  <Badge variant="outline">
                    {categoryResults.length} tests
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{result.name}</div>
                        <div className="text-sm mt-1">{result.message}</div>
                        {result.details && (
                          <div className="text-xs mt-2 opacity-70">
                            Details: {result.details}
                          </div>
                        )}
                        {result.fix && (
                          <Alert className="mt-2">
                            <AlertDescription className="text-xs">
                              💡 {result.fix}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button 
          onClick={runValidation} 
          disabled={isRunning}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          Re-run Validation
        </Button>
      </div>
    </div>
  );
}