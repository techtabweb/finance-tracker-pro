import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkle, 
  TrendUp, 
  TrendDown, 
  Warning, 
  CheckCircle, 
  Robot,
  Target,
  Calendar,
  Coins
} from '@phosphor-icons/react';

interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action?: string;
}

export function AIInsights() {
  const { expenses, budgets, categories } = useFinanceData();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newInsights: AIInsight[] = [];

    // Spending pattern analysis
    const thisMonth = new Date().getMonth();
    const thisMonthExpenses = (expenses || []).filter(expense => 
      new Date(expense.date).getMonth() === thisMonth
    );
    
    if (thisMonthExpenses.length > 0) {
      const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const dailyAverage = totalThisMonth / new Date().getDate();
      
      // High spending warning
      if (dailyAverage > 500) {
        newInsights.push({
          id: 'high-spending',
          type: 'warning',
          title: 'High Daily Spending Detected',
          description: `Your daily average is ₹${dailyAverage.toFixed(0)}. Consider reviewing your expenses.`,
          priority: 'high',
          icon: '🚨',
          action: 'Review Budget'
        });
      }

      // Budget analysis
      const monthlyBudget = (budgets || []).find(b => b.category === 'Monthly Total');
      if (monthlyBudget && totalThisMonth > monthlyBudget.limit * 0.8) {
        newInsights.push({
          id: 'budget-warning',
          type: 'warning',
          title: 'Budget Alert',
          description: `You've used ${((totalThisMonth / monthlyBudget.limit) * 100).toFixed(0)}% of your monthly budget.`,
          priority: 'high',
          icon: '💰',
          action: 'Adjust Spending'
        });
      }
    }

    // Category analysis
    const categorySpending = (categories || []).map(category => ({
      ...category,
      total: (expenses || [])
        .filter(exp => exp.category === category.name)
        .reduce((sum, exp) => sum + exp.amount, 0)
    })).sort((a, b) => b.total - a.total);

    if (categorySpending[0]?.total > 0) {
      newInsights.push({
        id: 'top-category',
        type: 'trend',
        title: 'Highest Spending Category',
        description: `${categorySpending[0].name} accounts for ₹${categorySpending[0].total.toFixed(0)} of your total spending.`,
        priority: 'medium',
        icon: '📊',
        action: 'View Analytics'
      });
    }

    // Positive insights
    const recentExpenses = (expenses || []).slice(-10);
    const hasGoodDescriptions = recentExpenses.filter(exp => exp.description.length > 5).length;
    
    if (hasGoodDescriptions >= 8) {
      newInsights.push({
        id: 'good-tracking',
        type: 'achievement',
        title: 'Great Expense Tracking!',
        description: 'You\'re doing excellent at adding detailed descriptions to your expenses.',
        priority: 'low',
        icon: '⭐',
        action: 'Keep it up!'
      });
    }

    // Smart tips
    const foodExpenses = (expenses || []).filter(exp => exp.category === 'Food & Dining');
    if (foodExpenses.length > 5) {
      const avgFoodExpense = foodExpenses.reduce((sum, exp) => sum + exp.amount, 0) / foodExpenses.length;
      if (avgFoodExpense > 300) {
        newInsights.push({
          id: 'food-tip',
          type: 'tip',
          title: 'Smart Savings Tip',
          description: 'Consider cooking at home more often. You could save ₹2000+ monthly!',
          priority: 'medium',
          icon: '💡',
          action: 'Set Cooking Goal'
        });
      }
    }

    // Weekend spending pattern
    const weekendExpenses = (expenses || []).filter(exp => {
      const day = new Date(exp.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    
    if (weekendExpenses.length > 0) {
      const weekendAvg = weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0) / weekendExpenses.length;
      if (weekendAvg > 800) {
        newInsights.push({
          id: 'weekend-tip',
          type: 'tip',
          title: 'Weekend Spending Pattern',
          description: `You spend ₹${weekendAvg.toFixed(0)} on average during weekends. Plan budget-friendly activities!`,
          priority: 'medium',
          icon: '🏖️',
          action: 'Plan Activities'
        });
      }
    }

    setInsights(newInsights.slice(0, 4)); // Limit to 4 insights
    setLastAnalysis(new Date());
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if ((expenses || []).length > 0 && !lastAnalysis) {
      generateInsights();
    }
  }, [(expenses || []).length]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning className="w-5 h-5" />;
      case 'tip': return <Sparkle className="w-5 h-5" />;
      case 'achievement': return <CheckCircle className="w-5 h-5" />;
      case 'trend': return <TrendUp className="w-5 h-5" />;
      default: return <Robot className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-600 bg-red-50 border-red-200';
      case 'tip': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'achievement': return 'text-green-600 bg-green-50 border-green-200';
      case 'trend': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if ((expenses || []).length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-indigo-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Robot className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-800">AI Financial Insights</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="text-xs"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Sparkle className="w-3 h-3" />
                Refresh
              </div>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="text-center">
                <div className="relative mx-auto w-12 h-12 mb-3">
                  <Robot className="w-12 h-12 text-indigo-500 animate-pulse" />
                  <div className="absolute inset-0 border-2 border-indigo-500 rounded-full animate-ping opacity-20" />
                </div>
                <p className="text-indigo-700 font-medium">Analyzing your spending patterns...</p>
                <p className="text-indigo-600 text-sm">Generating personalized insights</p>
              </div>
            </motion.div>
          ) : insights.length > 0 ? (
            insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                  {getInsightIcon(insight.type)}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <Robot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Start adding expenses to get AI insights!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {lastAnalysis && (
          <div className="text-center pt-2 border-t border-indigo-100">
            <p className="text-xs text-indigo-600">
              Last analyzed: {lastAnalysis.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}