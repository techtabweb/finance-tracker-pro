import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Expense } from '@/lib/types';
// Import removed - now using Spark LLM directly

export interface ExpensePrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  period: 'weekly' | 'monthly' | 'quarterly';
  reasoning: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PredictionAnalysis {
  totalPredictedSpending: number;
  categoryPredictions: ExpensePrediction[];
  budgetAlerts: Array<{
    category: string;
    message: string;
    severity: 'warning' | 'danger';
  }>;
  insights: string[];
  lastUpdated: string;
}

export function useExpensePrediction() {
  const [expenses] = useKV<Expense[]>('expenses', []);
  const [predictions, setPredictions] = useKV<PredictionAnalysis | null>('expense-predictions', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSpendingPatterns = (expenses: Expense[]) => {
    const now = new Date();
    const categorizedData: { [category: string]: { amounts: number[], dates: string[] } } = {};
    
    // Group expenses by category
    expenses.forEach(expense => {
      if (!categorizedData[expense.category]) {
        categorizedData[expense.category] = { amounts: [], dates: [] };
      }
      categorizedData[expense.category].amounts.push(expense.amount);
      categorizedData[expense.category].dates.push(expense.date);
    });

    // Calculate trends and patterns
    const patterns = Object.entries(categorizedData).map(([category, data]) => {
      const amounts = data.amounts;
      const dates = data.dates.map(d => new Date(d));
      
      // Calculate basic statistics
      const total = amounts.reduce((sum, amount) => sum + amount, 0);
      const average = total / amounts.length;
      const monthlyAverage = amounts.length > 0 ? total / Math.max(1, 
        Math.ceil((Math.max(...dates.map(d => d.getTime())) - Math.min(...dates.map(d => d.getTime()))) / (1000 * 60 * 60 * 24 * 30))
      ) : 0;

      // Calculate trend (simple linear regression on recent data)
      const recentExpenses = amounts.slice(-6); // Last 6 transactions
      const trend = recentExpenses.length >= 3 ? 
        (recentExpenses[recentExpenses.length - 1] - recentExpenses[0]) / recentExpenses.length : 0;

      return {
        category,
        totalSpent: total,
        averageAmount: average,
        monthlyAverage,
        transactionCount: amounts.length,
        trend: trend > 50 ? 'increasing' : trend < -50 ? 'decreasing' : 'stable',
        lastTransactionDate: Math.max(...dates.map(d => d.getTime())),
        amounts,
        dates: data.dates
      };
    });

    return patterns;
  };

  const generatePredictions = useCallback(async () => {
    if (!expenses || expenses.length < 5) {
      setError('Need at least 5 expenses for meaningful predictions');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const patterns = analyzeSpendingPatterns(expenses);
      
      // Prepare data for AI analysis
      const analysisData = {
        totalExpenses: expenses.length,
        timeRange: {
          start: Math.min(...expenses.map(e => new Date(e.date).getTime())),
          end: Math.max(...expenses.map(e => new Date(e.date).getTime()))
        },
        categoryPatterns: patterns.map(p => ({
          category: p.category,
          monthlyAverage: p.monthlyAverage,
          trend: p.trend,
          transactionCount: p.transactionCount,
          recentAmounts: p.amounts.slice(-5)
        }))
      };

      const prompt = spark.llmPrompt`You are a financial AI assistant specializing in Indian spending patterns. Analyze the expense data and provide predictions.

Historical Data: ${JSON.stringify(analysisData, null, 2)}

Recent Patterns: ${patterns.map(p => `${p.category}: Monthly Average ₹${p.monthlyAverage.toFixed(0)}, Trend: ${p.trend}, Transactions: ${p.transactionCount}`).join('\n')}

Return ONLY a valid JSON response in this exact format (no additional text):

{
  "categoryPredictions": [
    {
      "category": "Food & Dining",
      "predictedAmount": 5000,
      "confidence": 85,
      "period": "monthly",
      "reasoning": "Based on consistent spending pattern with slight upward trend",
      "trend": "increasing",
      "seasonalFactor": 1.1,
      "riskLevel": "medium"
    }
  ],
  "insights": [
    "Your food spending tends to increase during festival seasons",
    "Transportation costs are stable month-to-month"
  ],
  "totalPredictedSpending": 15000,
  "budgetAlerts": [
    {
      "category": "Entertainment",
      "message": "Predicted spending may exceed typical budget by 20%",
      "severity": "warning"
    }
  ]
}

Requirements:
- Focus on Indian spending patterns and festivals
- All amounts in Indian Rupees
- Confidence scores between 70-95
- Provide 2-4 actionable insights
- Include seasonal factors (festivals, monsoons, etc.)
- Risk levels: low, medium, high
- Trends: increasing, decreasing, stable`;

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
        throw new Error('AI response is not a valid object');
      }
      
      // Validate and structure the response
      const predictionAnalysis: PredictionAnalysis = {
        totalPredictedSpending: Math.max(0, Number(analysisResult.totalPredictedSpending) || 0),
        categoryPredictions: (Array.isArray(analysisResult.categoryPredictions) ? analysisResult.categoryPredictions : [])
          .filter((pred: any) => pred.category && pred.predictedAmount > 0)
          .map((pred: any) => ({
            category: pred.category,
            predictedAmount: Math.max(0, Number(pred.predictedAmount)),
            confidence: Math.min(95, Math.max(70, Number(pred.confidence) || 75)),
            period: pred.period || 'monthly',
            reasoning: String(pred.reasoning || 'Based on historical patterns').substring(0, 200),
            trend: ['increasing', 'decreasing', 'stable'].includes(pred.trend) ? pred.trend : 'stable',
            seasonalFactor: Math.max(0.5, Math.min(2.0, Number(pred.seasonalFactor) || 1.0)),
            riskLevel: ['low', 'medium', 'high'].includes(pred.riskLevel) ? pred.riskLevel : 'medium'
          })),
        budgetAlerts: (Array.isArray(analysisResult.budgetAlerts) ? analysisResult.budgetAlerts : [])
          .filter((alert: any) => alert.category && alert.message)
          .map((alert: any) => ({
            category: alert.category,
            message: String(alert.message).substring(0, 150),
            severity: ['warning', 'danger'].includes(alert.severity) ? alert.severity : 'warning'
          })),
        insights: (Array.isArray(analysisResult.insights) ? analysisResult.insights : [])
          .filter((insight: any) => insight && typeof insight === 'string')
          .map((insight: string) => insight.substring(0, 200))
          .slice(0, 5),
        lastUpdated: new Date().toISOString()
      };

      setPredictions(predictionAnalysis);
      console.log('✅ Expense predictions generated successfully');
      
    } catch (error) {
      console.error('❌ Error generating predictions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate predictions');
    } finally {
      setIsAnalyzing(false);
    }
  }, [expenses]);

  // Automatically analyze when expenses change significantly
  useEffect(() => {
    if (!generatePredictions) return; // Ensure function is available
    
    const lastAnalysisDate = predictions?.lastUpdated;
    const daysSinceLastAnalysis = lastAnalysisDate 
      ? Math.floor((Date.now() - new Date(lastAnalysisDate).getTime()) / (1000 * 60 * 60 * 24))
      : 7; // Force analysis if no previous analysis

    // Re-analyze if it's been more than 3 days or we have significant new data
    if (daysSinceLastAnalysis >= 3 && expenses && expenses.length >= 10) {
      generatePredictions();
    }
  }, [expenses?.length, generatePredictions, predictions]);

  const getPredictionForCategory = (category: string): ExpensePrediction | null => {
    return predictions?.categoryPredictions.find(p => p.category === category) || null;
  };

  const getUpcomingExpenseAlerts = () => {
    if (!predictions) return [];
    
    return predictions.categoryPredictions
      .filter(pred => pred.riskLevel === 'high' || pred.confidence > 85)
      .map(pred => ({
        category: pred.category,
        amount: pred.predictedAmount,
        message: `Expected ₹${pred.predictedAmount.toFixed(0)} in ${pred.category}`,
        type: pred.riskLevel === 'high' ? 'warning' : 'info'
      }));
  };

  const refreshPredictions = () => {
    if (generatePredictions) {
      generatePredictions();
    }
  };

  return {
    predictions,
    isAnalyzing,
    error,
    generatePredictions,
    getPredictionForCategory,
    getUpcomingExpenseAlerts,
    refreshPredictions,
    hasEnoughData: (expenses?.length || 0) >= 5
  };
}