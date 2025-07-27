import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { useFinanceData } from '@/hooks/use-finance-data';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  ShieldCheck,
  Calendar,
  PiggyBank,
  CreditCard,
  Repeat
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SpendingAlert {
  id: string;
  type: 'budget_exceeded' | 'unusual_spending' | 'trend_alert' | 'goal_impact';
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendation: string;
  amount?: number;
  threshold?: number;
  confidence: number;
  actionable: boolean;
}

interface SpendingPrediction {
  category: string;
  currentSpent: number;
  predictedTotal: number;
  budgetLimit: number;
  riskLevel: 'safe' | 'caution' | 'danger' | 'critical';
  confidence: number;
  daysRemaining: number;
  suggestedDailyLimit: number;
}

export function SmartSpendingAlerts() {
  const { expenses, budgets, setBudget } = useFinanceData();
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate smart alerts using ML analysis
  const generateAlerts = async () => {
    if (expenses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get current month data
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
      
      // Calculate days remaining in month
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysRemaining = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Prepare data for analysis
      const analysisData = {
        expenses: currentExpenses.map(exp => ({
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
          dayOfMonth: new Date(exp.date).getDate()
        })),
        budgets: budgets.map(budget => ({
          category: budget.category,
          limit: budget.limit,
          spent: budget.spent || 0
        })),
        daysRemaining,
        dayOfMonth: now.getDate(),
        totalDaysInMonth: endOfMonth.getDate()
      };

      const prompt = spark.llmPrompt`
Analyze the following financial data and generate smart spending alerts and predictions:

Data: ${JSON.stringify(analysisData)}

Generate responses in this JSON format:
{
  "alerts": [
    {
      "id": "unique_id",
      "type": "budget_exceeded|unusual_spending|trend_alert|goal_impact",
      "category": "category_name",
      "severity": "low|medium|high|critical",
      "title": "Alert title",
      "message": "Detailed message about the issue",
      "recommendation": "Actionable recommendation",
      "amount": amount_if_applicable,
      "threshold": threshold_if_applicable,
      "confidence": confidence_0_to_100,
      "actionable": true_or_false
    }
  ],
  "predictions": [
    {
      "category": "category_name",
      "currentSpent": current_spent_amount,
      "predictedTotal": predicted_month_total,
      "budgetLimit": budget_limit,
      "riskLevel": "safe|caution|danger|critical",
      "confidence": confidence_0_to_100,
      "daysRemaining": days_remaining,
      "suggestedDailyLimit": suggested_daily_limit
    }
  ]
}

Focus on:
1. Budget overspending alerts
2. Unusual spending pattern detection
3. End-of-month predictions
4. Actionable recommendations with specific amounts in INR
5. Daily spending limits to stay on track
`;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const result = JSON.parse(response);

      setAlerts(result.alerts || []);
      setPredictions(result.predictions || []);
    } catch (error) {
      console.error('Error generating alerts:', error);
      // Fallback to basic alerts
      generateBasicAlerts();
    } finally {
      setLoading(false);
    }
  };

  // Fallback basic alerts
  const generateBasicAlerts = () => {
    const basicAlerts: SpendingAlert[] = [];
    const basicPredictions: SpendingPrediction[] = [];

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
    
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    budgets.forEach(budget => {
      const categoryExpenses = currentExpenses.filter(exp => exp.category === budget.category);
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = (spent / budget.limit) * 100;

      // Generate alert for overspending
      if (percentage > 100) {
        basicAlerts.push({
          id: `overspend_${budget.category}`,
          type: 'budget_exceeded',
          category: budget.category,
          severity: 'critical',
          title: `Budget Exceeded: ${budget.category}`,
          message: `You've spent ₹${spent.toLocaleString()} out of ₹${budget.limit.toLocaleString()} budget (${percentage.toFixed(0)}%)`,
          recommendation: `Reduce ${budget.category} spending or increase budget by ₹${(spent - budget.limit).toLocaleString()}`,
          amount: spent,
          threshold: budget.limit,
          confidence: 95,
          actionable: true
        });
      } else if (percentage > 80) {
        basicAlerts.push({
          id: `warning_${budget.category}`,
          type: 'trend_alert',
          category: budget.category,
          severity: percentage > 90 ? 'high' : 'medium',
          title: `High Spending: ${budget.category}`,
          message: `You've spent ${percentage.toFixed(0)}% of your ${budget.category} budget`,
          recommendation: `Limit ${budget.category} spending to ₹${Math.round((budget.limit - spent) / daysRemaining)} per day`,
          amount: spent,
          threshold: budget.limit,
          confidence: 85,
          actionable: true
        });
      }

      // Generate predictions
      const dailyAverage = spent / (now.getDate() || 1);
      const predictedTotal = dailyAverage * endOfMonth.getDate();
      const suggestedDaily = Math.max(0, (budget.limit - spent) / daysRemaining);

      let riskLevel: 'safe' | 'caution' | 'danger' | 'critical' = 'safe';
      if (predictedTotal > budget.limit * 1.2) riskLevel = 'critical';
      else if (predictedTotal > budget.limit) riskLevel = 'danger';
      else if (predictedTotal > budget.limit * 0.8) riskLevel = 'caution';

      basicPredictions.push({
        category: budget.category,
        currentSpent: spent,
        predictedTotal,
        budgetLimit: budget.limit,
        riskLevel,
        confidence: 80,
        daysRemaining,
        suggestedDailyLimit: suggestedDaily
      });
    });

    setAlerts(basicAlerts);
    setPredictions(basicPredictions);
  };

  useEffect(() => {
    generateAlerts();
  }, [expenses, budgets]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600';
      case 'danger': return 'text-orange-600';
      case 'caution': return 'text-yellow-600';
      case 'safe': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const applyRecommendation = (alert: SpendingAlert) => {
    if (alert.type === 'budget_exceeded' && alert.amount && alert.threshold) {
      const newBudget = Math.ceil(alert.amount * 1.1); // 10% buffer
      setBudget(alert.category, newBudget);
      toast.success(`Budget for ${alert.category} increased to ₹${newBudget.toLocaleString()}`);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Smart Spending Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span>Analyzing spending patterns...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {alerts.filter(alert => alert.severity === 'critical').length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Critical Alerts
          </h3>
          {alerts.filter(alert => alert.severity === 'critical').map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-red-800">{alert.title}</h4>
                        <p className="text-red-700 mt-1">{alert.message}</p>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="bg-red-100 rounded-lg p-3">
                      <p className="text-red-800 text-sm">💡 {alert.recommendation}</p>
                    </div>

                    {alert.actionable && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => applyRecommendation(alert)}
                      >
                        Apply Fix
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Spending Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Month-End Predictions
        </h3>
        
        <div className="grid gap-4">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{prediction.category}</h4>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Spent:</span>
                      <span className="font-medium">₹{prediction.currentSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted Total:</span>
                      <span className={`font-medium ${getRiskColor(prediction.riskLevel)}`}>
                        ₹{prediction.predictedTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Budget Limit:</span>
                      <span className="font-medium">₹{prediction.budgetLimit.toLocaleString()}</span>
                    </div>

                    <Progress 
                      value={(prediction.currentSpent / prediction.budgetLimit) * 100}
                      className="h-2"
                    />

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {prediction.daysRemaining} days remaining
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Suggested daily limit: ₹{prediction.suggestedDailyLimit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Other Alerts */}
      {alerts.filter(alert => alert.severity !== 'critical').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Other Alerts
          </h3>
          
          <div className="space-y-3">
            {alerts.filter(alert => alert.severity !== 'critical').map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{alert.message}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-800 text-sm">💡 {alert.recommendation}</p>
                    </div>

                    {alert.actionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => applyRecommendation(alert)}
                      >
                        Apply Suggestion
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {alerts.length === 0 && predictions.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">All Good!</h3>
            <p className="text-gray-500">No spending alerts or concerns detected</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}