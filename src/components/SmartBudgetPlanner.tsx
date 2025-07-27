import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { useFinanceData } from '@/hooks/use-finance-data';
import { 
  Target, 
  TrendUp, 
  Calculator, 
  PiggyBank, 
  Lightbulb,
  ArrowRight,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface BudgetRecommendation {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reasoning: string;
  impact: 'positive' | 'neutral' | 'negative';
  confidence: number;
  potentialSavings: number;
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
  priority: 'high' | 'medium' | 'low';
}

interface BudgetScenario {
  id: string;
  name: string;
  description: string;
  totalBudget: number;
  categoryAllocations: Record<string, number>;
  expectedSavings: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

export function SmartBudgetPlanner() {
  const { expenses = [], budgets = [], setBudget, getTotalSpent } = useFinanceData();
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [scenarios, setScenarios] = useState<BudgetScenario[]>([]);
  const [totalBudgetGoal, setTotalBudgetGoal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Generate smart budget recommendations
  // Fallback basic recommendations - defined before use
  const generateBasicRecommendations = useCallback(() => {
    const basicRecommendations: BudgetRecommendation[] = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    budgets.forEach(budget => {
      const monthlyExpenses = expenses.filter(exp => 
        exp.category === budget.category && exp.date.startsWith(currentMonth)
      );
      const spent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const utilizationRate = budget.limit > 0 ? spent / budget.limit : 0;

      if (utilizationRate < 0.5) {
        // Under-utilized budget
        const recommended = Math.max(spent * 1.2, budget.limit * 0.7);
        basicRecommendations.push({
          category: budget.category,
          currentBudget: budget.limit,
          recommendedBudget: recommended,
          reasoning: `Low utilization (${(utilizationRate * 100).toFixed(0)}%). Consider reducing budget.`,
          impact: 'positive',
          confidence: 80,
          potentialSavings: budget.limit - recommended,
          monthlyTrend: 'stable',
          priority: 'medium'
        });
      } else if (utilizationRate > 1.1) {
        // Over budget
        const recommended = spent * 1.1;
        basicRecommendations.push({
          category: budget.category,
          currentBudget: budget.limit,
          recommendedBudget: recommended,
          reasoning: `Consistently overspending (${(utilizationRate * 100).toFixed(0)}%). Consider increasing budget.`,
          impact: 'negative',
          confidence: 90,
          potentialSavings: 0,
          monthlyTrend: 'increasing',
          priority: 'high'
        });
      }
    });

    setRecommendations(basicRecommendations);
    
    // Generate basic scenarios
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const basicScenarios = [
      {
        id: 'conservative',
        name: 'Conservative Plan',
        description: 'Conservative spending with focus on savings',
        totalBudget: totalBudget * 0.8,
        categoryAllocations: budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.limit * 0.8 }), {}),
        expectedSavings: totalBudget * 0.2,
        riskLevel: 'conservative' as const
      },
      {
        id: 'moderate',
        name: 'Balanced Plan',
        description: 'Balanced approach with moderate savings',
        totalBudget: totalBudget * 0.9,
        categoryAllocations: budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.limit * 0.9 }), {}),
        expectedSavings: totalBudget * 0.1,
        riskLevel: 'moderate' as const
      }
    ];

    setScenarios(basicScenarios);
  }, [budgets, expenses, setRecommendations, setScenarios]);

  const generateRecommendations = useCallback(async () => {
    if (expenses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Analyze spending patterns over last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentExpenses = expenses.filter(exp => 
        new Date(exp.date) >= threeMonthsAgo
      );

      // Calculate category-wise spending patterns
      const categoryAnalysis = budgets.map(budget => {
        const categoryExpenses = recentExpenses.filter(exp => exp.category === budget.category);
        const monthlySpending = categoryExpenses.reduce((acc, exp) => {
          const month = exp.date.slice(0, 7);
          acc[month] = (acc[month] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>);

        const amounts = Object.values(monthlySpending).map(val => Number(val) || 0);
        const avgSpending = amounts.length > 0 ? amounts.reduce((a, b) => Number(a) + Number(b), 0) / amounts.length : 0;
        const maxSpending = amounts.length > 0 ? Math.max(...amounts) : 0;
        const minSpending = amounts.length > 0 ? Math.min(...amounts) : 0;

        return {
          category: budget.category,
          currentBudget: budget.limit,
          avgSpending,
          maxSpending,
          minSpending,
          variance: maxSpending - minSpending,
          trend: amounts.length >= 2 ? (amounts[amounts.length - 1] > amounts[0] ? 'increasing' : 'decreasing') : 'stable'
        };
      });

      const analysisData = {
        categoryAnalysis,
        totalCurrentBudget: budgets.reduce((sum, b) => sum + b.limit, 0),
        totalRecentSpending: recentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        expenseCount: recentExpenses.length
      };

      const promptText = `Analyze budget and spending data to provide smart recommendations: ${JSON.stringify(analysisData)}`;
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

      setRecommendations(Array.isArray(result.recommendations) ? result.recommendations : []);
      setScenarios(Array.isArray(result.scenarios) ? result.scenarios : []);
      
      // Set initial total budget goal
      const currentTotal = budgets.reduce((sum, b) => sum + b.limit, 0);
      setTotalBudgetGoal(currentTotal);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      generateBasicRecommendations();
    } finally {
      setLoading(false);
    }
  }, [expenses, budgets, generateBasicRecommendations]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const applyRecommendation = (rec: BudgetRecommendation) => {
    setBudget(rec.category, rec.recommendedBudget);
    toast.success(`Budget for ${rec.category} updated to ₹${formatCurrency(rec.recommendedBudget)}`);
  };

  const applyScenario = (scenario: BudgetScenario) => {
    Object.entries(scenario.categoryAllocations).forEach(([category, amount]) => {
      setBudget(category, amount);
    });
    toast.success(`Applied ${scenario.name} budget scenario`);
    setSelectedScenario(scenario.id);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
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

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Smart Budget Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-lg font-medium">Calculating optimal budgets...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Goal Setting */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Monthly Budget Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="min-w-0 flex-shrink-0">Total Budget Goal:</Label>
            <Input
              type="number"
              value={totalBudgetGoal}
              onChange={(e) => setTotalBudgetGoal(Number(e.target.value))}
              className="flex-1"
              placeholder="Enter your monthly budget goal"
            />
            <span className="text-gray-500">INR</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-blue-600 font-semibold">Current Budget</div>
              <div className="text-lg font-bold text-blue-800">
                ₹{formatCurrency(budgets.reduce((sum, b) => sum + b.limit, 0))}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-green-600 font-semibold">This Month Spent</div>
              <div className="text-lg font-bold text-green-800">
                ₹{formatCurrency(getTotalSpent())}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-purple-600 font-semibold">Remaining</div>
              <div className="text-lg font-bold text-purple-800">
                ₹{formatCurrency(budgets.reduce((sum, b) => sum + b.limit, 0) - getTotalSpent())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Smart Recommendations
        </h3>
        
        {recommendations.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Budgets Look Good!</h3>
              <p className="text-gray-500">Your current budget allocation seems optimal</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{rec.category}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          <Badge className={getImpactColor(rec.impact)}>
                            {rec.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Confidence</div>
                        <div className="font-semibold">{rec.confidence}%</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Current</div>
                          <div className="font-semibold">₹{formatCurrency(rec.currentBudget)}</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Recommended</div>
                          <div className="font-semibold text-blue-600">₹{formatCurrency(rec.recommendedBudget)}</div>
                        </div>
                        {rec.potentialSavings > 0 && (
                          <>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Savings</div>
                              <div className="font-semibold text-green-600">₹{formatCurrency(rec.potentialSavings)}</div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-blue-800">{rec.reasoning}</p>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => applyRecommendation(rec)}
                      >
                        Apply Recommendation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Scenarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-green-600" />
          Budget Scenarios
        </h3>
        
        <div className="grid gap-4">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card transition-all duration-300 ${
                selectedScenario === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{scenario.name}</h4>
                      <p className="text-gray-600 mt-1">{scenario.description}</p>
                    </div>
                    <Badge variant={scenario.riskLevel === 'conservative' ? 'default' : 
                                 scenario.riskLevel === 'moderate' ? 'secondary' : 'destructive'}>
                      {scenario.riskLevel}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500">Total Budget</div>
                        <div className="font-semibold text-lg">₹{formatCurrency(scenario.totalBudget)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-green-600">Expected Savings</div>
                        <div className="font-semibold text-lg text-green-700">₹{formatCurrency(scenario.expectedSavings)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Category Allocation:</div>
                      {Object.entries(scenario.categoryAllocations).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{category}</span>
                          <span className="font-medium">₹{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className={`w-full ${selectedScenario === scenario.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => applyScenario(scenario)}
                    >
                      {selectedScenario === scenario.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        'Apply This Scenario'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}