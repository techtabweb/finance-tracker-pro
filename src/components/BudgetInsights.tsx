import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Learning } from '@/components/Learning';
import { SmartSpendingAlerts } from '@/components/SmartSpendingAlerts';
import { SmartBudgetPlanner } from '@/components/SmartBudgetPlanner';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceData } from '@/hooks/use-finance-data';
import { TrendUp, TrendDown, Warning, Target, Brain, Lightning, ChartBar, Calendar, Lightbulb, Shield, Calculator } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';

interface MLInsight {
  id: string;
  type: 'spending_pattern' | 'budget_optimization' | 'overspending_risk' | 'seasonal_trend' | 'category_anomaly';
  category?: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendation: string;
  action?: {
    type: 'adjust_budget' | 'set_alert' | 'schedule_review';
    value?: number;
    category?: string;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  data: {
    current: number;
    predicted: number;
    variance: number;
    timeframe: string;
  };
}

interface BudgetOptimization {
  category: string;
  currentBudget: number;
  suggestedBudget: number;
  reasoning: string;
  confidence: number;
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function BudgetInsights() {
  const { expenses = [], budgets = [], setBudget } = useFinanceData();
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [optimizations, setOptimizations] = useState<BudgetOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<MLInsight | null>(null);

  // Generate ML insights using Gemini AI
  const generateInsights = useCallback(async () => {
    if (expenses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Prepare expense data for analysis
      const expenseData = expenses.map(expense => ({
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        month: new Date(expense.date).getMonth(),
        weekday: new Date(expense.date).getDay()
      }));

      const budgetData = budgets.map(budget => ({
        category: budget.category,
        amount: budget.limit,
        spent: budget.spent || 0
      }));

      const prompt = spark.llmPrompt`You are a financial AI assistant. Analyze the following expense and budget data to provide insights and optimizations.

Expense Data: ${JSON.stringify(expenseData)}
Budget Data: ${JSON.stringify(budgetData)}

Return ONLY a valid JSON response with insights and optimizations arrays.`;
      const response = await window.spark.llm(prompt, 'gpt-4o', true);
      
      // Handle empty or invalid response
      if (!response || response.trim() === '') {
        console.error('Empty response from AI');
        throw new Error('Empty AI response');
      }
      
      let analysisResult;
      try {
        // Try to extract JSON if response contains additional text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        analysisResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, 'Response:', response);
        throw new Error('Invalid AI response format');
      }

      // Validate the response structure
      if (!analysisResult || typeof analysisResult !== 'object') {
        console.error('Invalid analysis result:', analysisResult);
        throw new Error('AI response is not a valid object');
      }

      // Ensure we have valid arrays
      const validInsights = Array.isArray(analysisResult.insights) ? analysisResult.insights : [];
      const validOptimizations = Array.isArray(analysisResult.optimizations) ? analysisResult.optimizations : [];

      // If we got valid data, use it; otherwise fall back to basic analysis
      if (validInsights.length > 0 || validOptimizations.length > 0) {
        setInsights(validInsights);
        setOptimizations(validOptimizations);
      } else {
        console.log('No valid insights from AI, using fallback analysis');
        generateBasicInsights();
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate ML insights');
      
      // Fallback with basic analysis
      generateBasicInsights();
    } finally {
      setLoading(false);
    }
  }, [expenses, budgets]);

  // Fallback basic insights
  const generateBasicInsights = () => {
    const basicInsights: MLInsight[] = [];
    const basicOptimizations: BudgetOptimization[] = [];

    // Analyze spending patterns
    const categorySpending = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categorySpending).forEach(([category, amount]) => {
      const budget = budgets.find(b => b.category === category);
      if (budget && amount > budget.limit * 0.8) {
        basicInsights.push({
          id: `overspend_${category}`,
          type: 'overspending_risk',
          category,
          title: `High spending in ${category}`,
          description: `You've spent ₹${formatCurrency(amount)} out of ₹${formatCurrency(budget.limit)} budget`,
          impact: amount > budget.limit ? 'high' : 'medium',
          confidence: 85,
          recommendation: amount > budget.limit 
            ? `Consider reducing ${category} expenses or increasing budget`
            : `Monitor ${category} spending closely this month`,
          trend: 'increasing',
          data: {
            current: amount,
            predicted: amount * 1.1,
            variance: ((amount - budget.limit) / budget.limit) * 100,
            timeframe: 'This month'
          }
        });
      }

      if (budget && amount < budget.limit * 0.5) {
        basicOptimizations.push({
          category,
          currentBudget: budget.limit,
          suggestedBudget: Math.round(amount * 1.2),
          reasoning: 'Low utilization suggests budget can be reduced',
          confidence: 75,
          potentialSavings: budget.limit - Math.round(amount * 1.2),
          riskLevel: 'low'
        });
      }
    });

    setInsights(basicInsights);
    setOptimizations(basicOptimizations);
  };

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const applyOptimization = async (optimization: BudgetOptimization) => {
    setBudget(optimization.category, optimization.suggestedBudget);
    toast.success(`Budget for ${optimization.category} updated to ₹${formatCurrency(optimization.suggestedBudget)}`);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendDown className="w-4 h-4 text-green-500" />;
      default: return <ChartBar className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              ML Budget Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-lg font-medium">Analyzing spending patterns...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🧠 ML Budget Insights</h2>
        <p className="text-gray-600">AI-powered budget optimization and overspending prevention</p>
      </motion.div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Spending Alerts
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Budget Planner
          </TabsTrigger>
          <TabsTrigger value="optimizations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Insights Available</h3>
                <p className="text-gray-500">Add more expenses to get AI-powered insights</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedInsight(insight)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTrendIcon(insight.trend)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                            {insight.category && (
                              <Badge variant="secondary" className="mt-1">
                                {insight.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">{insight.confidence}% confidence</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{insight.description}</p>

                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightning className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Recommendation</span>
                        </div>
                        <p className="text-blue-800">{insight.recommendation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Current: </span>
                          <span className="font-medium">₹{formatCurrency(insight.data.current)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Predicted: </span>
                          <span className="font-medium">₹{formatCurrency(insight.data.predicted)}</span>
                        </div>
                      </div>

                      {insight.action && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (insight.action?.type === 'adjust_budget' && insight.action.category && insight.action.value) {
                                setBudget(insight.action.category, insight.action.value);
                                toast.success(`Budget adjusted for ${insight.action.category}`);
                              }
                            }}
                          >
                            Apply Recommendation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SmartSpendingAlerts />
        </TabsContent>

        <TabsContent value="planner" className="space-y-4">
          <SmartBudgetPlanner />
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          {optimizations.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Optimizations Available</h3>
                <p className="text-gray-500">Your budgets are well-optimized!</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {optimizations.map((optimization, index) => (
                <motion.div
                  key={optimization.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{optimization.category}</h3>
                        <Badge variant={optimization.riskLevel === 'low' ? 'default' : 'destructive'}>
                          {optimization.riskLevel} risk
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Current Budget:</span>
                          <span className="font-semibold">₹{formatCurrency(optimization.currentBudget)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Suggested Budget:</span>
                          <span className="font-semibold text-green-600">₹{formatCurrency(optimization.suggestedBudget)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Potential Savings:</span>
                          <span className="font-semibold text-green-600">₹{formatCurrency(optimization.potentialSavings)}</span>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-green-800">{optimization.reasoning}</p>
                          <div className="mt-2 text-sm text-green-600">
                            Confidence: {optimization.confidence}%
                          </div>
                        </div>

                        <Button 
                          className="w-full"
                          onClick={() => applyOptimization(optimization)}
                        >
                          Apply Optimization
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{selectedInsight.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInsight(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(selectedInsight.trend)}
                    <Badge className={getImpactColor(selectedInsight.impact)}>
                      {selectedInsight.impact} impact
                    </Badge>
                    <span className="text-sm text-gray-500">{selectedInsight.confidence}% confidence</span>
                  </div>

                  <p className="text-gray-700">{selectedInsight.description}</p>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 AI Recommendation</h4>
                    <p className="text-blue-800">{selectedInsight.recommendation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Current</div>
                      <div className="text-lg font-semibold">₹{formatCurrency(selectedInsight.data.current)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Predicted</div>
                      <div className="text-lg font-semibold">₹{formatCurrency(selectedInsight.data.predicted)}</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-yellow-600">Variance</div>
                    <div className="text-lg font-semibold text-yellow-800">
                      {(selectedInsight.data.variance || 0) > 0 ? '+' : ''}{(selectedInsight.data.variance || 0).toFixed(1)}%
                    </div>
                  </div>

                  {selectedInsight.action && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (selectedInsight.action?.type === 'adjust_budget' && selectedInsight.action.category && selectedInsight.action.value) {
                          setBudget(selectedInsight.action.category, selectedInsight.action.value);
                          toast.success(`Budget adjusted for ${selectedInsight.action.category}`);
                          setSelectedInsight(null);
                        }
                      }}
                    >
                      Apply Recommendation
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}