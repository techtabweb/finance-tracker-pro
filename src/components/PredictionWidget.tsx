import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExpensePrediction } from '@/hooks/use-expense-prediction';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { motion } from 'framer-motion';
import { 
  TrendUp, 
  TrendDown, 
  Minus, 
  Brain,
  Sparkle,
  Warning,
  CheckCircle,
  ArrowRight
} from '@phosphor-icons/react';

export function PredictionWidget() {
  const { predictions, isAnalyzing, hasEnoughData } = useExpensePrediction();
  const { setActiveTab } = useFinanceData();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp className="h-3 w-3 text-red-500" />;
      case 'decreasing': return <TrendDown className="h-3 w-3 text-green-500" />;
      case 'stable': return <Minus className="h-3 w-3 text-blue-500" />;
      default: return <Brain className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!hasEnoughData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🔮</div>
            <h3 className="font-semibold text-purple-900 mb-2">AI Predictions Coming Soon</h3>
            <p className="text-sm text-purple-700 mb-4">
              Add a few more expenses to unlock smart spending predictions
            </p>
            <Badge variant="outline" className="bg-white/50">
              <Brain className="h-3 w-3 mr-1" />
              Powered by Gemini AI
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3 animate-pulse">🧠</div>
            <h3 className="font-semibold text-blue-900 mb-2">AI Analyzing Your Data</h3>
            <p className="text-sm text-blue-700">
              Generating smart predictions based on your spending patterns...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!predictions) {
    return null;
  }

  const topPredictions = predictions.categoryPredictions
    .sort((a, b) => b.predictedAmount - a.predictedAmount)
    .slice(0, 3);

  const highRiskPredictions = predictions.categoryPredictions.filter(p => p.riskLevel === 'high');
  const hasAlerts = predictions.budgetAlerts.length > 0 || highRiskPredictions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="relative">
                <span className="text-2xl">🔮</span>
                <Sparkle className="absolute -top-1 -right-1 h-3 w-3 text-purple-500" />
              </div>
              <span>AI Predictions</span>
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                Gemini AI
              </Badge>
            </CardTitle>
            {hasAlerts && (
              <Warning className="h-5 w-5 text-amber-500 animate-pulse" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Prediction */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Next Month Total</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-900 mb-1">
              {formatCurrency(predictions.totalPredictedSpending)}
            </div>
            <div className="text-xs text-indigo-600">
              Based on {predictions.categoryPredictions.length} categories
            </div>
          </div>

          {/* Top Predictions */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 text-sm flex items-center gap-2">
              <span>📊</span>
              Top Spending Categories
            </h4>
            <div className="space-y-2">
              {topPredictions.map((prediction, index) => (
                <div 
                  key={prediction.category}
                  className="flex items-center justify-between bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {prediction.category === 'Food & Dining' ? '🍽️' :
                       prediction.category === 'Transportation' ? '🚗' :
                       prediction.category === 'Shopping' ? '🛍️' :
                       prediction.category === 'Entertainment' ? '🎮' :
                       prediction.category === 'Bills & Utilities' ? '🏠' :
                       prediction.category === 'Healthcare' ? '🏥' :
                       prediction.category === 'Education' ? '📚' :
                       prediction.category === 'Travel' ? '✈️' :
                       prediction.category === 'Groceries' ? '🛒' : '💰'}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {prediction.category}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {getTrendIcon(prediction.trend)}
                        <span className="text-gray-600">{prediction.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(prediction.predictedAmount)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRiskColor(prediction.riskLevel)}`}
                    >
                      {prediction.riskLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          {predictions.insights.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>💡</span>
                Quick Insight
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {predictions.insights[0]}
              </p>
            </div>
          )}

          {/* View Full Report Button */}
          <Button 
            onClick={() => setActiveTab('predictions')}
            variant="outline"
            className="w-full bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/70 text-indigo-700 hover:text-indigo-800"
          >
            <span>View Full Report</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {/* Last Updated */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Last updated: {new Date(predictions.lastUpdated).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}