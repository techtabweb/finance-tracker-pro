import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, formatDate } from '@/lib/format';
import { AddGoalDialog } from './AddGoalDialog';
import { AddToGoalDialog } from './AddToGoalDialog';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SavingsGoals() {
  const { savingsGoals, deleteSavingsGoal } = useFinanceData();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddToGoal, setShowAddToGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🚀';
      case 'medium': return '⭐';
      case 'low': return '🐌';
      default: return '⭐';
    }
  };

  const getGoalEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('emergency') || lowerName.includes('fund')) return '🛡️';
    if (lowerName.includes('vacation') || lowerName.includes('travel')) return '✈️';
    if (lowerName.includes('car') || lowerName.includes('bike')) return '🚗';
    if (lowerName.includes('house') || lowerName.includes('home')) return '🏠';
    if (lowerName.includes('laptop') || lowerName.includes('computer') || lowerName.includes('phone')) return '💻';
    if (lowerName.includes('wedding')) return '💒';
    if (lowerName.includes('education') || lowerName.includes('course')) return '🎓';
    return '💎';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const handleAddToGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowAddToGoal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>🎯</span>
            Savings Goals
          </h2>
          <p className="text-gray-600 text-sm mt-1">Track your progress toward financial dreams</p>
        </div>
        <Button 
          onClick={() => setShowAddGoal(true)} 
          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0 shadow-lg h-12 px-6 rounded-xl w-full sm:w-auto"
        >
          <span className="text-xl mr-2">✨</span>
          Add Goal
        </Button>
      </motion.div>

      {/* Goals Stats */}
      {savingsGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-white/80 text-sm">Total Goals</p>
                  <p className="text-2xl font-bold">{savingsGoals.length}</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {savingsGoals.filter(goal => (goal.current / goal.target) * 100 >= 100).length}
                  </p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Total Saved</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(savingsGoals.reduce((sum, goal) => sum + goal.current, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {savingsGoals.map((goal, index) => {
              const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              const isCompleted = progress >= 100;
              const daysRemaining = Math.max(0, Math.floor((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
              const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  layout
                >
                  <Card className={`relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isCompleted ? 'ring-2 ring-green-300' : isOverdue ? 'ring-2 ring-red-300' : ''
                  }`}>
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <span className="text-lg">✅</span>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                            <span className="text-2xl">{getGoalEmoji(goal.name)}</span>
                            {goal.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                              <span className="mr-1">{getPriorityEmoji(goal.priority)}</span>
                              {goal.priority}
                            </Badge>
                            {isCompleted && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                🎉 Completed!
                              </Badge>
                            )}
                            {isOverdue && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                ⏰ Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavingsGoal(goal.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                        >
                          <span className="text-lg">🗑️</span>
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold text-gray-900">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={Math.min(progress, 100)} 
                            className={`h-4 bg-gray-200 ${getProgressColor(progress)}`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-md">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-gray-600">💰 Current:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(goal.current)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">🎯 Target:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(goal.target)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">📈 Remaining:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(Math.max(0, goal.target - goal.current))}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm bg-blue-50 p-3 rounded-xl">
                        <span className="text-xl">📅</span>
                        <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-blue-700'}`}>
                          {daysRemaining > 0 
                            ? `${daysRemaining} days remaining`
                            : new Date(goal.deadline) < new Date()
                              ? 'Deadline passed'
                              : 'Due today'
                          }
                        </span>
                      </div>

                      {!isCompleted && (
                        <Button 
                          onClick={() => handleAddToGoal(goal.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md h-10 rounded-xl"
                        >
                          <span className="text-lg mr-2">💸</span>
                          Add Money
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-medium mb-3">No savings goals yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking your progress toward financial dreams like emergency fund, vacation, or that new gadget you've been wanting!
              </p>
              <Button 
                onClick={() => setShowAddGoal(true)}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0 shadow-lg h-12 px-8 rounded-xl"
              >
                <span className="text-xl mr-2">✨</span>
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AddGoalDialog 
        open={showAddGoal} 
        onOpenChange={setShowAddGoal}
      />
      
      <AddToGoalDialog 
        open={showAddToGoal} 
        onOpenChange={setShowAddToGoal}
        goalId={selectedGoalId}
      />
    </div>
  );
}