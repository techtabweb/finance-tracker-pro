import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Expense } from '@/lib/types';
import { callGeminiApi } from '@/lib/gemini-api';

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

  // Automatically analyze when expenses change significantly
  useEffect(() => {
    const lastAnalysisDate = predictions?.lastUpdated;
    const daysSinceLastAnalysis = lastAnalysisDate 
      ? Math.floor((Date.now() - new Date(lastAnalysisDate).getTime()) / (1000 * 60 * 60 * 24))
      : 7; // Force analysis if no previous analysis

    // Re-analyze if it's been more than 3 days or we have significant new data
    if (daysSinceLastAnalysis >= 3 && expenses.length >= 10) {
      generatePredictions();
    }
  }, [expenses.length]);

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

  const generatePredictions = async () => {
    if (expenses.length < 5) {
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

      const prompt = `Analyze the following Indian expense data and predict future spending patterns. Consider seasonal factors, trends, and typical Indian spending behaviors.

Historical Data:
${JSON.stringify(analysisData, null, 2)}

Recent Expenses by Category:
${patterns.map(p => `${p.category}: Monthly Average ₹${p.monthlyAverage.toFixed(0)}, Trend: ${p.trend}, Transactions: ${p.transactionCount}`).join('\n')}

Please provide detailed predictions considering:
1. Indian seasonal spending (festivals, monsoons, school seasons)
2. Economic patterns in India
3. Category-specific trends
4. Risk factors for overspending

For each category with significant data, predict:
- Expected monthly spending
- Confidence level (70-95%)
- Trend direction
- Risk assessment
- Reasoning

Return a JSON object with this structure:
{
  "categoryPredictions": [
    {
      "category": "string",
      "predictedAmount": number,
      "confidence": number,
      "period": "monthly",
      "reasoning": "string",
      "trend": "increasing|decreasing|stable",
      "seasonalFactor": number,
      "riskLevel": "low|medium|high"
    }
  ],
  "insights": ["string array of key insights"],
  "totalPredictedSpending": number,
  "budgetAlerts": [
    {
      "category": "string",
      "message": "string",
      "severity": "warning|danger"
    }
  ]
}`;

      const response = await callGeminiApi(prompt, {
        jsonMode: true,
        temperature: 0.3,
        maxTokens: 4096
      });

      const analysisResult = JSON.parse(response);
      
      // Validate and structure the response
      const predictionAnalysis: PredictionAnalysis = {
        totalPredictedSpending: Math.max(0, Number(analysisResult.totalPredictedSpending) || 0),
        categoryPredictions: (analysisResult.categoryPredictions || [])
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
        budgetAlerts: (analysisResult.budgetAlerts || [])
          .filter((alert: any) => alert.category && alert.message)
          .map((alert: any) => ({
            category: alert.category,
            message: String(alert.message).substring(0, 150),
            severity: ['warning', 'danger'].includes(alert.severity) ? alert.severity : 'warning'
          })),
        insights: (analysisResult.insights || [])
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
  };

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
    generatePredictions();
  };

  return {
    predictions,
    isAnalyzing,
    error,
    generatePredictions,
    getPredictionForCategory,
    getUpcomingExpenseAlerts,
    refreshPredictions,
    hasEnoughData: expenses.length >= 5
  };
}