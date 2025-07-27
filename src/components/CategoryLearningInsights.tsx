import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCategoryLearning } from '@/hooks/use-category-learning';
import { useFinanceData } from '@/hooks/use-finance-data';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendUp, 
  Lightbulb, 
  Target, 
  Storefront, 
  ChartBar,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';

export function CategoryLearningInsights() {
  const { getLearningStats, getTopMerchantsByCategory, learningPatterns = [] } = useCategoryLearning();
  const { categories = [] } = useFinanceData();
  const isMobile = useIsMobile();
  
  const stats = getLearningStats();
  const topMerchants = getTopMerchantsByCategory();
  
  const recentLearning = learningPatterns.slice(0, 5);
  
  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || '#6b7280';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (stats.totalPatterns === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Building Your Learning Profile</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                As you categorize expenses, our AI learns your preferences and will provide better suggestions over time.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              💡 Tip: Correct AI suggestions to help the system learn faster
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Learning Statistics */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-500" />
            Learning Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <motion.div 
              className="text-center p-3 bg-blue-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatterns}</div>
              <div className="text-xs text-blue-700 font-medium">Learning Patterns</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 bg-green-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="text-2xl font-bold text-green-600">{stats.categoriesLearned}</div>
              <div className="text-xs text-green-700 font-medium">Categories Known</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 bg-orange-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="text-2xl font-bold text-orange-600">{stats.merchantsLearned}</div>
              <div className="text-xs text-orange-700 font-medium">Merchants Known</div>
            </motion.div>
            
            <motion.div 
              className={`text-center p-3 rounded-lg border ${getAccuracyColor(stats.aiAccuracy)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="text-2xl font-bold">{stats.aiAccuracy}%</div>
              <div className="text-xs font-medium">AI Accuracy</div>
            </motion.div>
          </div>

          {/* AI Performance Insight */}
          {stats.aiAccuracy > 0 && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <TrendUp className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-purple-900 text-sm">
                    {stats.aiAccuracy >= 80 ? 'Excellent Learning Progress!' : 
                     stats.aiAccuracy >= 60 ? 'Good Learning Progress' : 
                     'Building Learning Foundation'}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    {stats.aiAccuracy >= 80 ? 
                      'The AI suggestions are highly accurate. Your corrections have trained the system well!' :
                      stats.aiAccuracy >= 60 ?
                      'The AI is learning from your preferences. Keep correcting suggestions to improve accuracy.' :
                      'The system is learning your patterns. More corrections will improve future suggestions.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Merchants by Category */}
      {topMerchants.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Storefront className="w-5 h-5 text-green-500" />
              Smart Merchant Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMerchants.slice(0, isMobile ? 3 : 5).map((insight, index) => (
                <motion.div
                  key={`${insight.category}-${insight.merchant}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: getCategoryColor(insight.category) }}
                    />
                    <div>
                      <div className="font-medium text-sm">{insight.merchant}</div>
                      <div className="text-xs text-gray-600">{insight.category}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {insight.frequency} times
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Learning Activity */}
      {recentLearning.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLearning.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(pattern.userSelectedCategory) }}
                      />
                      <span className="font-medium text-sm text-gray-900">{pattern.userSelectedCategory}</span>
                      {pattern.aiSuggestedCategory && pattern.aiSuggestedCategory !== pattern.userSelectedCategory && (
                        <Badge variant="outline" className="text-xs">
                          Corrected
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {pattern.merchant && `${pattern.merchant} • `}{pattern.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(pattern.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Tips */}
      <Card className="glass-card border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-amber-900 text-sm mb-2">Improve Learning Accuracy</div>
              <div className="space-y-1 text-xs text-amber-800">
                <div>• Correct AI suggestions when they're wrong</div>
                <div>• Be consistent with category choices for similar merchants</div>
                <div>• Include descriptive merchant names when adding expenses</div>
                <div>• The more you use the system, the better it becomes!</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}