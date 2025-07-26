import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, formatDate } from '@/lib/format';
import { AddGoalDialog } from './AddGoalDialog';
import { AddToGoalDialog } from './AddToGoalDialog';
import { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Trash } from '@phosphor-icons/react';

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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const handleAddToGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowAddToGoal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground">Track your progress toward financial goals</p>
        </div>
        <Button onClick={() => setShowAddGoal(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Add Goal
        </Button>
      </div>

      {savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            const isCompleted = progress >= 100;
            const daysRemaining = Math.max(0, Math.floor((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
            
            return (
              <Card key={goal.id} className={`relative ${isCompleted ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target size={20} />
                        {goal.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Completed!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{formatCurrency(goal.current)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">{formatCurrency(goal.target)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">{formatCurrency(Math.max(0, goal.target - goal.current))}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>
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
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <TrendingUp size={16} className="mr-2" />
                      Add Money
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your progress toward financial goals like emergency fund, vacation, or new laptop!
            </p>
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus size={16} className="mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
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