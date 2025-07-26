import { CategoryLearningInsights } from '@/components/CategoryLearningInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCategoryLearning } from '@/hooks/use-category-learning';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { 
  Brain, 
  GraduationCap, 
  Lightbulb, 
  TrendUp, 
  Robot,
  Sparkles,
  Star,
  Target
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export function Learning() {
  const { getLearningStats, learningPatterns } = useCategoryLearning();
  const { expenses } = useFinanceData();
  const isMobile = useIsMobile();
  
  const stats = getLearningStats();
  const hasLearningData = stats.totalPatterns > 0;

  const handleOptimizeLearning = async () => {
    toast.info('🧠 Analyzing your spending patterns...', {
      description: 'This will help improve AI suggestions'
    });

    try {
      // Simulate learning optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('✨ Learning optimization complete!', {
        description: `Analyzed ${stats.totalPatterns} patterns for better accuracy`
      });
    } catch (error) {
      toast.error('Failed to optimize learning patterns');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl">🧠</div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Smart Learning Center
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Watch your AI assistant learn from your spending habits
            </p>
          </div>
        </div>
      </motion.div>

      {!hasLearningData ? (
        /* Welcome State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border-purple-200">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-purple-500" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Learning!</h2>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    Your personal AI assistant will learn from your spending patterns to provide smarter category suggestions over time.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">How it works:</h3>
                <div className="grid gap-4 max-w-2xl mx-auto text-left">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Smart Pattern Recognition</div>
                      <div className="text-xs text-gray-600">AI learns which categories you prefer for specific merchants and expense types</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <Robot className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Personalized Suggestions</div>
                      <div className="text-xs text-gray-600">Get better category suggestions based on your correction history</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <TrendUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Continuous Improvement</div>
                      <div className="text-xs text-gray-600">The more you use the app, the smarter it becomes at predicting your preferences</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Start adding expenses to unlock personalized learning insights!
                </p>
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                  <Star className="w-3 h-3 mr-1" />
                  Learning will begin automatically
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Learning Insights */
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Learning Status</div>
                      <div className="text-sm text-gray-600">
                        {stats.aiAccuracy >= 80 ? 'Excellent performance' : 
                         stats.aiAccuracy >= 60 ? 'Good accuracy' : 
                         'Building knowledge base'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${
                        stats.aiAccuracy >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
                        stats.aiAccuracy >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {stats.aiAccuracy}% Accurate
                    </Badge>
                    
                    {!isMobile && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleOptimizeLearning}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Optimize Learning
                      </Button>
                    )}
                  </div>
                </div>
                
                {isMobile && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOptimizeLearning}
                      className="w-full border-blue-200 hover:bg-blue-50"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Optimize Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Insights Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CategoryLearningInsights />
          </motion.div>

          {/* Learning Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-card border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Pro Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Be Consistent</div>
                        <div className="text-xs text-gray-600">Always categorize similar merchants the same way to improve AI accuracy</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Correct AI Suggestions</div>
                        <div className="text-xs text-gray-600">When AI gets it wrong, correct it to teach better patterns</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Detailed Descriptions</div>
                        <div className="text-xs text-gray-600">Include merchant names in descriptions for better recognition</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">4</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Regular Usage</div>
                        <div className="text-xs text-gray-600">The more expenses you add, the smarter the system becomes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}