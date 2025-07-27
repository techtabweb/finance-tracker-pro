import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExpensePrediction } from '@/hooks/use-expense-prediction';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartLineUp, 
  ChartLineDown, 
  Minus, 
  ArrowClockwise, 
  Warning, 
  Brain,
  Calendar,
  Target,
  TrendUp,
  Clock,
  Lightbulb,
  ChartBar,
  Shield,
  Lightning
} from '@phosphor-icons/react';

export function ExpensePredictions() {
  const { predictions, isAnalyzing, error, generatePredictions, refreshPredictions, hasEnoughData } = useExpensePrediction();
  const { budgets = [] } = useFinanceData();
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ChartLineUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ChartLineDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-500" />;
      default: return <TrendUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!hasEnoughData) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold mb-2">AI Expense Predictions</h3>
            <p className="text-gray-600 text-center mb-4">
              Add at least 5 expenses to start getting AI-powered predictions about your future spending
            </p>
            <Badge variant="outline" className="px-4 py-1">
              Powered by Gemini AI 🧠
            </Badge>
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
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🔮 Expense Predictions
            <Badge variant="secondary" className="ml-2">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </h2>
          <p className="text-gray-600">Smart predictions based on your spending patterns</p>
        </div>
        <Button 
          onClick={refreshPredictions} 
          disabled={isAnalyzing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowClockwise className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </Button>
      </motion.div>

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <Warning className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isAnalyzing && !predictions && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Spending Patterns</h3>
            <p className="text-gray-600 mb-4">AI is processing your expense history...</p>
            <div className="flex items-center gap-2">
              <ArrowClockwise className="h-4 w-4 animate-spin" />
              <span className="text-sm">This may take a few moments</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions Content */}
      {predictions && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Warning className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Total Prediction Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Next Month Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-700">
                        {formatCurrency(predictions.totalPredictedSpending)}
                      </div>
                      <p className="text-blue-600">Expected total spending</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Updated {new Date(predictions.lastUpdated).toLocaleDateString()}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        Based on {predictions.categoryPredictions.length} categories
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.categoryPredictions
                .sort((a, b) => b.predictedAmount - a.predictedAmount)
                .slice(0, 6)
                .map((prediction, index) => (
                  <motion.div
                    key={prediction.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {prediction.category}
                          </CardTitle>
                          {getTrendIcon(prediction.trend)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-2xl font-bold">
                            {formatCurrency(prediction.predictedAmount)}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}% confidence
                            </span>
                            <Badge 
                              variant="outline" 
                              className={getRiskColor(prediction.riskLevel)}
                            >
                              {prediction.riskLevel} risk
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={prediction.confidence} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="space-y-4">
              {predictions.categoryPredictions
                .sort((a, b) => b.predictedAmount - a.predictedAmount)
                .map((prediction, index) => {
                  const currentBudget = budgets.find(b => b.category === prediction.category);
                  const budgetProgress = currentBudget 
                    ? (prediction.predictedAmount / currentBudget.limit) * 100 
                    : 0;

                  return (
                    <motion.div
                      key={prediction.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {prediction.category === 'Food & Dining' ? '🍽️' :
                                 prediction.category === 'Transportation' ? '🚗' :
                                 prediction.category === 'Shopping' ? '🛍️' :
                                 prediction.category === 'Entertainment' ? '🎮' :
                                 prediction.category === 'Bills & Utilities' ? '🏠' :
                                 prediction.category === 'Healthcare' ? '🏥' :
                                 prediction.category === 'Education' ? '📚' :
                                 prediction.category === 'Travel' ? '✈️' :
                                 prediction.category === 'Groceries' ? '🛒' : '💰'}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{prediction.category}</CardTitle>
                                <CardDescription>
                                  {prediction.period} prediction • {getTrendIcon(prediction.trend)} {prediction.trend}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={getRiskColor(prediction.riskLevel)}>
                              {prediction.riskLevel} risk
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold">
                                  {formatCurrency(prediction.predictedAmount)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Predicted spending
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                                  {prediction.confidence}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Confidence
                                </div>
                              </div>
                            </div>

                            {currentBudget && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>vs Budget ({formatCurrency(currentBudget.limit)})</span>
                                  <span className={budgetProgress > 100 ? 'text-red-600' : 'text-green-600'}>
                                    {budgetProgress.toFixed(0)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.min(100, budgetProgress)} 
                                  className={`h-2 ${budgetProgress > 100 ? 'bg-red-100' : 'bg-green-100'}`}
                                />
                              </div>
                            )}

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{prediction.reasoning}</p>
                            </div>

                            {prediction.seasonalFactor !== 1 && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Lightning className="h-4 w-4" />
                                <span>
                                  Seasonal factor: {prediction.seasonalFactor > 1 ? 'Higher' : 'Lower'} spending expected
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {predictions.budgetAlerts.length > 0 ? (
              <div className="space-y-4">
                {predictions.budgetAlerts.map((alert, index) => (
                  <motion.div
                    key={`${alert.category}-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Alert className={alert.severity === 'danger' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                      <Warning className={`h-4 w-4 ${alert.severity === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{alert.category}</div>
                          <AlertDescription className={alert.severity === 'danger' ? 'text-red-800' : 'text-yellow-800'}>
                            {alert.message}
                          </AlertDescription>
                        </div>
                        <Badge variant={alert.severity === 'danger' ? 'destructive' : 'outline'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </Alert>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 mb-2">All Good!</h3>
                  <p className="text-gray-600 text-center">
                    No budget alerts detected in your predictions. Keep up the good spending habits!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-4">
              {predictions.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="flex items-start gap-3 pt-6">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{insight}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Call to Action */}
      {!predictions && hasEnoughData && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-dashed border-2 border-blue-200">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
              <p className="text-gray-600 text-center mb-4">
                Generate smart predictions about your future spending patterns
              </p>
              <Button onClick={generatePredictions} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Generate Predictions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}