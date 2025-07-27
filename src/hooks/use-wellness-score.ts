import { useKV } from '@github/spark/hooks';
import { useMemo } from 'react';
import { Expense, Budget, SavingsGoal, WellnessScore, Achievement, PersonalizedTip } from '@/lib/types';
import { getCurrentMonth, getLastThreeMonths } from '@/lib/format';

export function useWellnessScore(
  expenses: Expense[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  monthlyBudget: number
) {
  // Use simple keys without user isolation since we removed auth
  const [achievements, setAchievements] = useKV<Achievement[]>('achievements', []);
  const [wellnessHistory, setWellnessHistory] = useKV<WellnessScore[]>('wellness-history', []);

  // Calculate financial wellness score
  const wellnessScore = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0) || monthlyBudget;

    // Budget Health (0-30 points)
    let budgetHealth = 0;
    if (totalBudget > 0) {
      const spendingRatio = totalSpent / totalBudget;
      if (spendingRatio <= 0.8) budgetHealth = 30;
      else if (spendingRatio <= 0.9) budgetHealth = 25;
      else if (spendingRatio <= 1.0) budgetHealth = 20;
      else if (spendingRatio <= 1.1) budgetHealth = 10;
      else budgetHealth = 0;
    }

    // Savings Rate (0-25 points)
    let savingsRate = 0;
    const totalSavingsProgress = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
    const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0);
    if (totalSavingsTarget > 0) {
      const savingsRatio = totalSavingsProgress / totalSavingsTarget;
      if (savingsRatio >= 0.8) savingsRate = 25;
      else if (savingsRatio >= 0.6) savingsRate = 20;
      else if (savingsRatio >= 0.4) savingsRate = 15;
      else if (savingsRatio >= 0.2) savingsRate = 10;
      else savingsRate = 5;
    }

    // Spending Control (0-20 points)
    let spendingControl = 0;
    const lastThreeMonths = getLastThreeMonths();
    const monthlySpending = lastThreeMonths.map(month => {
      const monthExpenses = expenses.filter(e => e.date.startsWith(month));
      return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    });
    
    if (monthlySpending.length >= 2) {
      const avgSpending = monthlySpending.reduce((sum, amount) => sum + amount, 0) / monthlySpending.length;
      const variance = monthlySpending.reduce((sum, amount) => sum + Math.pow(amount - avgSpending, 2), 0) / monthlySpending.length;
      const coefficient = avgSpending > 0 ? Math.sqrt(variance) / avgSpending : 0;
      
      if (coefficient <= 0.1) spendingControl = 20;
      else if (coefficient <= 0.2) spendingControl = 15;
      else if (coefficient <= 0.3) spendingControl = 10;
      else spendingControl = 5;
    }

    // Consistency Score (0-15 points)
    let consistencyScore = 0;
    const daysWithExpenses = new Set(expenses.filter(e => e.date.startsWith(currentMonth)).map(e => e.date)).size;
    const daysInMonth = new Date().getDate();
    const trackingRatio = daysWithExpenses / daysInMonth;
    
    if (trackingRatio >= 0.8) consistencyScore = 15;
    else if (trackingRatio >= 0.6) consistencyScore = 12;
    else if (trackingRatio >= 0.4) consistencyScore = 8;
    else consistencyScore = 5;

    // Diversity Score (0-10 points)
    let diversityScore = 0;
    const categoriesUsed = new Set(currentMonthExpenses.map(e => e.category)).size;
    if (categoriesUsed >= 6) diversityScore = 10;
    else if (categoriesUsed >= 4) diversityScore = 8;
    else if (categoriesUsed >= 2) diversityScore = 6;
    else diversityScore = 3;

    const overall = budgetHealth + savingsRate + spendingControl + consistencyScore + diversityScore;

    return {
      overall,
      budgetHealth,
      savingsRate,
      spendingControl,
      consistencyScore,
      diversityScore,
      lastCalculated: new Date().toISOString(),
    };
  }, [expenses, budgets, savingsGoals, monthlyBudget]);

  // Generate personalized tips
  const personalizedTips = useMemo((): PersonalizedTip[] => {
    const tips: PersonalizedTip[] = [];
    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0) || monthlyBudget;

    // Budget tips
    if (totalBudget > 0 && totalSpent / totalBudget > 0.9) {
      tips.push({
        id: 'budget-overspend',
        category: 'budget',
        title: 'Budget Alert! 🚨',
        description: 'You\'ve spent over 90% of your monthly budget',
        actionable: 'Review your remaining expenses and prioritize essential items only',
        priority: 'high',
        icon: 'AlertTriangle',
        emoji: '⚠️',
        estimatedImpact: 'Prevent overspending by ₹500-2000'
      });
    }

    // Savings tips
    const activeSavingsGoals = savingsGoals.filter(goal => goal.current < goal.target);
    if (activeSavingsGoals.length === 0) {
      tips.push({
        id: 'create-savings-goal',
        category: 'savings',
        title: 'Set Your Next Savings Goal! 🎯',
        description: 'Having clear savings targets helps build wealth faster',
        actionable: 'Create a new savings goal for emergency fund or future plans',
        priority: 'medium',
        icon: 'Target',
        emoji: '💰',
        estimatedImpact: 'Increase savings by 15-25%'
      });
    }

    // Spending pattern tips
    const categorySpending = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
    if (topCategory && topCategory[1] > totalSpent * 0.4) {
      tips.push({
        id: 'category-dominance',
        category: 'spending',
        title: 'Spending Concentration Alert 📊',
        description: `${topCategory[0]} accounts for ${Math.round(topCategory[1] / totalSpent * 100)}% of your spending`,
        actionable: 'Consider ways to optimize expenses in this category',
        priority: 'medium',
        icon: 'PieChart',
        emoji: '📈',
        estimatedImpact: 'Save 10-20% on major expenses'
      });
    }

    // Emergency fund tip
    const emergencyFund = savingsGoals.find(goal => goal.name.toLowerCase().includes('emergency'));
    if (!emergencyFund && totalSpent > 0) {
      const recommendedEmergency = totalSpent * 6; // 6 months of expenses
      tips.push({
        id: 'emergency-fund',
        category: 'emergency',
        title: 'Build Emergency Fund 🛡️',
        description: 'Financial experts recommend 6 months of expenses as emergency fund',
        actionable: `Start with ₹${Math.round(recommendedEmergency / 10)} and gradually build to ₹${Math.round(recommendedEmergency)}`,
        priority: 'high',
        icon: 'Shield',
        emoji: '🚨',
        estimatedImpact: 'Protect against unexpected expenses'
      });
    }

    // Investment tip for good savers
    if (wellnessScore.savingsRate >= 20) {
      tips.push({
        id: 'investment-opportunity',
        category: 'investment',
        title: 'Consider Investments 📈',
        description: 'You\'re saving well! Time to make your money work harder',
        actionable: 'Explore SIPs, PPF, or ELSS for tax-saving investments',
        priority: 'low',
        icon: 'TrendingUp',
        emoji: '🚀',
        estimatedImpact: 'Potentially 8-12% annual returns'
      });
    }

    return tips.slice(0, 5); // Return top 5 tips
  }, [expenses, budgets, savingsGoals, monthlyBudget, wellnessScore]);

  // Define all possible achievements
  const allAchievements = useMemo((): Achievement[] => [
    // Budgeting achievements
    {
      id: 'first-budget',
      title: 'Budget Beginner',
      description: 'Set your first budget',
      icon: 'Target',
      emoji: '🎯',
      category: 'budgeting',
      points: 10,
      progress: budgets.length > 0 ? 1 : 0,
      maxProgress: 1,
      difficulty: 'easy'
    },
    {
      id: 'budget-master',
      title: 'Budget Master',
      description: 'Stay within budget for 3 months',
      icon: 'Crown',
      emoji: '👑',
      category: 'budgeting',
      points: 50,
      progress: 0, // Would need historical data
      maxProgress: 3,
      difficulty: 'hard'
    },
    {
      id: 'category-budgets',
      title: 'Category Champion',
      description: 'Set budgets for 5 different categories',
      icon: 'Grid',
      emoji: '📊',
      category: 'budgeting',
      points: 25,
      progress: budgets.length,
      maxProgress: 5,
      difficulty: 'medium'
    },

    // Saving achievements
    {
      id: 'first-goal',
      title: 'Goal Getter',
      description: 'Create your first savings goal',
      icon: 'Flag',
      emoji: '🏁',
      category: 'saving',
      points: 15,
      progress: savingsGoals.length > 0 ? 1 : 0,
      maxProgress: 1,
      difficulty: 'easy'
    },
    {
      id: 'save-10k',
      title: 'Ten Thousand Club',
      description: 'Save ₹10,000 total',
      icon: 'Banknote',
      emoji: '💰',
      category: 'saving',
      points: 30,
      progress: Math.min(savingsGoals.reduce((sum, goal) => sum + goal.current, 0), 10000),
      maxProgress: 10000,
      difficulty: 'medium'
    },
    {
      id: 'save-100k',
      title: 'Lakh Master',
      description: 'Save ₹1,00,000 total',
      icon: 'Trophy',
      emoji: '🏆',
      category: 'saving',
      points: 100,
      progress: Math.min(savingsGoals.reduce((sum, goal) => sum + goal.current, 0), 100000),
      maxProgress: 100000,
      difficulty: 'legendary'
    },

    // Spending achievements
    {
      id: 'expense-tracker',
      title: 'Expense Tracker',
      description: 'Log 50 expenses',
      icon: 'List',
      emoji: '📝',
      category: 'spending',
      points: 20,
      progress: Math.min(expenses.length, 50),
      maxProgress: 50,
      difficulty: 'medium'
    },
    {
      id: 'category-explorer',
      title: 'Category Explorer',
      description: 'Use 8 different expense categories',
      icon: 'Compass',
      emoji: '🧭',
      category: 'spending',
      points: 25,
      progress: new Set(expenses.map(e => e.category)).size,
      maxProgress: 8,
      difficulty: 'medium'
    },

    // Consistency achievements
    {
      id: 'week-tracker',
      title: 'Weekly Warrior',
      description: 'Track expenses for 7 consecutive days',
      icon: 'Calendar',
      emoji: '🗓️',
      category: 'consistency',
      points: 15,
      progress: 0, // Would need date analysis
      maxProgress: 7,
      difficulty: 'easy'
    },
    {
      id: 'month-tracker',
      title: 'Monthly Master',
      description: 'Track expenses for 30 days',
      icon: 'CalendarDays',
      emoji: '📅',
      category: 'consistency',
      points: 40,
      progress: 0, // Would need date analysis
      maxProgress: 30,
      difficulty: 'hard'
    },

    // Milestone achievements
    {
      id: 'wellness-score-50',
      title: 'Financial Fitness',
      description: 'Achieve wellness score of 50+',
      icon: 'Heart',
      emoji: '❤️',
      category: 'milestone',
      points: 35,
      progress: Math.min(wellnessScore.overall, 50),
      maxProgress: 50,
      difficulty: 'medium'
    },
    {
      id: 'wellness-score-80',
      title: 'Financial Guru',
      description: 'Achieve wellness score of 80+',
      icon: 'Star',
      emoji: '⭐',
      category: 'milestone',
      points: 75,
      progress: Math.min(wellnessScore.overall, 80),
      maxProgress: 80,
      difficulty: 'legendary'
    }
  ], [expenses, budgets, savingsGoals, wellnessScore]);

  // Update achievements when progress changes
  const updateAchievements = () => {
    setAchievements((current) => {
      const safeCurrentAchievements = current || [];
      const updatedAchievements = allAchievements.map(achievement => {
        const existing = safeCurrentAchievements.find(a => a.id === achievement.id);
        const isCompleted = achievement.progress >= achievement.maxProgress;
        
        if (existing) {
          return {
            ...existing,
            progress: achievement.progress,
            unlockedAt: isCompleted && !existing.unlockedAt ? new Date().toISOString() : existing.unlockedAt
          };
        } else if (isCompleted) {
          return {
            ...achievement,
            unlockedAt: new Date().toISOString()
          };
        }
        return achievement;
      });

      return updatedAchievements.filter(a => a.unlockedAt || a.progress > 0);
    });
  };

  // Save wellness score to history
  const saveWellnessScore = () => {
    setWellnessHistory((current) => {
      const newHistory = [wellnessScore, ...(current || []).slice(0, 29)]; // Keep last 30 scores
      return newHistory;
    });
  };

  return {
    wellnessScore,
    personalizedTips,
    achievements,
    allAchievements,
    wellnessHistory,
    updateAchievements,
    saveWellnessScore
  };
}