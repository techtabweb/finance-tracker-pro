import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useFinanceData } from '@/hooks/use-finance-data';
import { 
  Brain, 
  TrendUp, 
  TrendDown, 
  Warning, 
  CheckCircle, 
  Target,
  Shield,
  Lightbulb,
  ArrowRight
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/utils';

interface MLSummary {
  budgetHealth: {
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    message: string;
  };
  spendingTrend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    prediction: string;
  };
  topRecommendation: {
    category: string;
    action: string;
    impact: number;
  };
  riskAlerts: number;
  potentialSavings: number;
}

export function MLInsightsSummary() {
  const { expenses, budgets, setActiveTab } = useFinanceData();
  const [summary, setSummary] = useState<MLSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const generateSummary = useCallback(async () => {
    if (!expenses || expenses.length === 0 || !budgets || budgets.length === 0) {
      setLoading(false);
      return;
    }

    // Calculate current month data outside try block for fallback access
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
    const totalSpent = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);

    // Calculate budget utilization
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Analyze spending by category
    const categorySpending = budgets.map(budget => {
      const categoryExpenses = currentExpenses.filter(exp => exp.category === budget.category);
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        category: budget.category,
        spent,
        budget: budget.limit,
        utilization: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
        overspend: spent > budget.limit
      };
    });

    try {
      setLoading(true);

      const analysisData = {
        totalSpent,
        totalBudget,
        utilizationRate,
        categorySpending,
        expenseCount: currentExpenses.length,
        overspentCategories: categorySpending.filter(cat => cat.overspend).length
      };

      const promptText = `Analyze this financial data and provide a concise ML insights summary: ${JSON.stringify(analysisData)}`;
      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      
      let result;
      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, 'Response:', response);
        throw new Error('Invalid AI response format');
      }

      // Validate the response structure
      if (!result || typeof result !== 'object') {
        throw new Error('AI response is not a valid object');
      }
      
      setSummary(result);
    } catch (error) {
      console.error('Error generating ML summary:', error);
      
      // Fallback summary with proper access to variables
      const fallbackSummary: MLSummary = {
        budgetHealth: {
          score: Math.max(0, 100 - utilizationRate),
          status: utilizationRate > 100 ? 'critical' : utilizationRate > 80 ? 'warning' : 'good',
          message: `You've used ${utilizationRate.toFixed(0)}% of your monthly budget`
        },
        spendingTrend: {
          direction: 'stable',
          percentage: 0,
          prediction: 'Spending appears stable this month'
        },
        topRecommendation: {
          category: 'General',
          action: 'Monitor your spending patterns',
          impact: 0
        },
        riskAlerts: categorySpending.filter(cat => cat.overspend).length,
        potentialSavings: 0
      };
      setSummary(fallbackSummary);
    } finally {
      setLoading(false);
    }
  }, [expenses, budgets]);

  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <Warning className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <Warning className="w-5 h-5 text-red-600" />;
      default: return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendUp className="w-5 h-5 text-red-500" />;
      case 'decreasing': return <TrendDown className="w-5 h-5 text-green-500" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            ML Insights Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span>Analyzing your finances...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500">Add expenses and budgets to get ML insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          ML Insights Summary
        </h3>
        <p className="text-gray-600 text-sm">AI-powered analysis of your financial patterns</p>
      </motion.div>

      {/* Budget Health */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getHealthIcon(summary.budgetHealth.status)}
                <span className="font-medium">Budget Health</span>
              </div>
              <Badge className={getHealthColor(summary.budgetHealth.status)}>
                {summary.budgetHealth.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {summary.budgetHealth.score}/100
                </span>
                <Progress 
                  value={summary.budgetHealth.score} 
                  className="w-24 h-2"
                />
              </div>
              <p className="text-gray-700 text-sm">{summary.budgetHealth.message}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spending Trend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTrendIcon(summary.spendingTrend.direction)}
                <span className="font-medium">Spending Trend</span>
              </div>
              {summary.spendingTrend.percentage !== 0 && (
                <Badge variant="outline">
                  {summary.spendingTrend.percentage > 0 ? '+' : ''}{summary.spendingTrend.percentage.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-gray-700 text-sm">{summary.spendingTrend.prediction}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Alerts */}
      {summary.riskAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warning className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    {summary.riskAlerts} Risk Alert{summary.riskAlerts > 1 ? 's' : ''}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveTab('insights')}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Top Recommendation</span>
                </div>
                <p className="text-blue-700 text-sm mb-2">
                  <strong>{summary.topRecommendation.category}:</strong> {summary.topRecommendation.action}
                </p>
                {summary.topRecommendation.impact > 0 && (
                  <p className="text-blue-600 text-xs">
                    Potential impact: ₹{formatCurrency(summary.topRecommendation.impact)}
                  </p>
                )}
              </div>
              <Button 
                size="sm"
                onClick={() => setActiveTab('insights')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Potential Savings */}
      {summary.potentialSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium text-green-800">Potential Savings</span>
                    <div className="text-2xl font-bold text-green-700">
                      ₹{formatCurrency(summary.potentialSavings)}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveTab('insights')}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Optimize Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          className="w-full"
          onClick={() => setActiveTab('insights')}
        >
          View Full ML Analysis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}