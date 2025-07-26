import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useWellnessScore } from '@/hooks/use-wellness-score';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, AlertTriangle, Star, Crown, Heart, Zap, Gift } from '@phosphor-icons/react';

export function Wellness() {
  const { expenses, budgets, savingsGoals, monthlyBudget } = useFinanceData();
  const { wellnessScore, personalizedTips, achievements, allAchievements, updateAchievements, saveWellnessScore } = useWellnessScore(
    expenses,
    budgets,
    savingsGoals,
    monthlyBudget
  );
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<'score' | 'tips' | 'achievements'>('score');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Update achievements and save score on mount and data changes
  useEffect(() => {
    updateAchievements();
    saveWellnessScore();
  }, [expenses, budgets, savingsGoals, updateAchievements, saveWellnessScore]);

  // Check for new achievements
  useEffect(() => {
    const recentlyUnlocked = achievements
      .filter(a => a.unlockedAt && new Date(a.unlockedAt).getTime() > Date.now() - 5000)
      .map(a => a.id);
    
    if (recentlyUnlocked.length > 0) {
      setNewAchievements(recentlyUnlocked);
      setTimeout(() => setNewAchievements([]), 5000);
    }
  }, [achievements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', emoji: '🌟', desc: 'Excellent' };
    if (score >= 80) return { grade: 'A', emoji: '⭐', desc: 'Great' };
    if (score >= 70) return { grade: 'B+', emoji: '👍', desc: 'Good' };
    if (score >= 60) return { grade: 'B', emoji: '👌', desc: 'Fair' };
    if (score >= 50) return { grade: 'C', emoji: '🔶', desc: 'Average' };
    return { grade: 'D', emoji: '📈', desc: 'Needs Work' };
  };

  const scoreGrade = getScoreGrade(wellnessScore.overall);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const tabs = [
    { id: 'score', label: 'Score', icon: Heart, emoji: '💯' },
    { id: 'tips', label: 'Tips', icon: Target, emoji: '💡' },
    { id: 'achievements', label: 'Rewards', icon: Trophy, emoji: '🏆' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 text-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl sm:text-7xl mb-2">{scoreGrade.emoji}</div>
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
              Financial Wellness Score
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-lg opacity-90">
              <span>🇮🇳 Personalized for India</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-bold mb-2">
                {wellnessScore.overall}
                <span className="text-2xl sm:text-3xl opacity-80">/100</span>
              </div>
              <div className="text-xl opacity-90">
                Grade: {scoreGrade.grade} - {scoreGrade.desc}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Budget Health', value: wellnessScore.budgetHealth, max: 30, icon: '🎯' },
                { label: 'Savings Rate', value: wellnessScore.savingsRate, max: 25, icon: '💰' },
                { label: 'Spending Control', value: wellnessScore.spendingControl, max: 20, icon: '📊' },
                { label: 'Consistency', value: wellnessScore.consistencyScore, max: 15, icon: '📅' },
                { label: 'Diversity', value: wellnessScore.diversityScore, max: 10, icon: '🌈' },
                { label: 'Total Points', value: totalPoints, max: 500, icon: '🏆' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">{metric.icon}</div>
                  <div className="text-lg font-bold">{metric.value}</div>
                  <div className="text-xs opacity-80">{metric.label}</div>
                  {metric.max && (
                    <Progress 
                      value={(metric.value / metric.max) * 100} 
                      className="h-1 mt-2 bg-white/20"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/30">
        <CardContent className="p-3">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                size={isMobile ? "sm" : "default"}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 gap-2 ${
                  selectedTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-white/60'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span className={isMobile ? 'text-xs' : 'text-sm'}>{tab.label}</span>
                {tab.id === 'achievements' && unlockedAchievements.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {unlockedAchievements.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {selectedTab === 'score' && (
          <motion.div
            key="score"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    label: 'Budget Health', 
                    value: wellnessScore.budgetHealth, 
                    max: 30, 
                    icon: '🎯',
                    desc: 'How well you stick to your budgets'
                  },
                  { 
                    label: 'Savings Rate', 
                    value: wellnessScore.savingsRate, 
                    max: 25, 
                    icon: '💰',
                    desc: 'Progress towards your savings goals'
                  },
                  { 
                    label: 'Spending Control', 
                    value: wellnessScore.spendingControl, 
                    max: 20, 
                    icon: '📊',
                    desc: 'Consistency in your spending patterns'
                  },
                  { 
                    label: 'Tracking Consistency', 
                    value: wellnessScore.consistencyScore, 
                    max: 15, 
                    icon: '📅',
                    desc: 'How regularly you track expenses'
                  },
                  { 
                    label: 'Category Diversity', 
                    value: wellnessScore.diversityScore, 
                    max: 10, 
                    icon: '🌈',
                    desc: 'Variety in your spending categories'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{metric.icon}</span>
                        <div>
                          <div className="font-medium">{metric.label}</div>
                          <div className="text-sm text-gray-600">{metric.desc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {metric.value}/{metric.max}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round((metric.value / metric.max) * 100)}%
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={(metric.value / metric.max) * 100} 
                      className="h-2"
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'tips' && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {personalizedTips.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2">You're doing great!</h3>
                  <p className="text-gray-600">No urgent financial tips right now. Keep up the good work!</p>
                </CardContent>
              </Card>
            ) : (
              personalizedTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass-card border-l-4 ${
                    tip.priority === 'critical' ? 'border-l-red-500' :
                    tip.priority === 'high' ? 'border-l-orange-500' :
                    tip.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{tip.emoji}</div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                          <Badge 
                            variant={tip.priority === 'critical' ? 'destructive' : 'secondary'}
                            className="mt-1"
                          >
                            {tip.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-700">{tip.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">💡 Action Step:</div>
                        <p className="text-blue-700">{tip.actionable}</p>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        💰 Impact: {tip.estimatedImpact}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Achievement Stats */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{unlockedAchievements.length}</div>
                    <div className="text-sm text-gray-600">Unlocked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{allAchievements.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <div className="grid gap-4">
              {allAchievements.map((achievement, index) => {
                const isUnlocked = !!achievement.unlockedAt;
                const isNew = newAchievements.includes(achievement.id);
                const progress = (achievement.progress / achievement.maxProgress) * 100;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`relative overflow-hidden transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' 
                        : 'glass-card hover:shadow-md'
                    } ${isNew ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}>
                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            Unlocked!
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-60'}`}>
                            {achievement.emoji}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className={`font-semibold ${isUnlocked ? 'text-yellow-800' : 'text-gray-700'}`}>
                                {achievement.title}
                              </h3>
                              <p className={`text-sm ${isUnlocked ? 'text-yellow-600' : 'text-gray-600'}`}>
                                {achievement.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    achievement.difficulty === 'legendary' ? 'destructive' :
                                    achievement.difficulty === 'hard' ? 'secondary' :
                                    achievement.difficulty === 'medium' ? 'outline' :
                                    'default'
                                  }
                                  className="text-xs"
                                >
                                  {achievement.difficulty}
                                </Badge>
                                <span className="text-sm font-medium text-blue-600">
                                  {achievement.points} pts
                                </span>
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                {achievement.progress}/{achievement.maxProgress}
                              </div>
                            </div>
                            
                            <Progress 
                              value={progress} 
                              className={`h-2 ${isUnlocked ? 'bg-yellow-100' : ''}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Achievement Notification */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="text-sm opacity-90">
                  {achievements.find(a => a.id === newAchievements[0])?.title}
                </p>
                <div className="mt-2">
                  <Badge className="bg-white/20">
                    +{achievements.find(a => a.id === newAchievements[0])?.points} points
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}