import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, getMonthName, getCurrentMonth } from '@/lib/format';
import { AddExpenseDialog } from './AddExpenseDialog';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function Overview() {
  const { 
    getCurrentMonthExpenses, 
    getTotalSpent, 
    getTotalBudget, 
    monthlyBudget,
    budgets,
    categories 
  } = useFinanceData();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const totalSpent = getTotalSpent();
  const totalBudget = getTotalBudget();
  const categoryRemaining = totalBudget - totalSpent;
  const monthlyRemaining = monthlyBudget - totalSpent;
  const currentMonthExpenses = getCurrentMonthExpenses();
  const recentExpenses = currentMonthExpenses.slice(0, 3);

  const categoryBudgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const monthlyBudgetProgress = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const summaryCards = [
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      subtitle: getMonthName(getCurrentMonth()),
      icon: "💸",
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Monthly Budget",
      value: monthlyBudget > 0 ? formatCurrency(monthlyBudget) : 'Not Set',
      subtitle: monthlyBudget > 0 
        ? (monthlyRemaining < 0 ? `₹${Math.abs(monthlyRemaining)} over` : `₹${monthlyRemaining} left`)
        : 'Set your monthly limit',
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Category Budgets",
      value: totalBudget > 0 ? formatCurrency(totalBudget) : 'Not Set',
      subtitle: totalBudget > 0 
        ? (categoryRemaining < 0 ? `₹${Math.abs(categoryRemaining)} over` : `₹${categoryRemaining} left`)
        : 'Set category limits',
      icon: "🏷️",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Budget Status",
      value: (monthlyBudget > 0 && monthlyRemaining < 0) || (totalBudget > 0 && categoryRemaining < 0) 
        ? 'Over Budget' 
        : 'On Track',
      subtitle: monthlyBudget > 0 || totalBudget > 0 ? 'Budget tracking active' : 'No budgets set',
      icon: (monthlyBudget > 0 && monthlyRemaining < 0) || (totalBudget > 0 && categoryRemaining < 0) ? "⚠️" : "✅",
      color: "from-purple-500 to-violet-500"
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div 
        className="text-center py-8 px-4 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome to Your Financial Journey! 🚀
          </h2>
          <p className="text-white/90 text-sm sm:text-base">
            Track, manage, and grow your wealth with smart insights
          </p>
        </div>
        <div className="absolute -top-4 -right-4 text-6xl opacity-20">💰</div>
        <div className="absolute -bottom-4 -left-4 text-6xl opacity-20">📊</div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
                <span className="text-2xl">{card.icon}</span>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <p className="text-xs text-gray-600 leading-tight">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Progress */}
        {monthlyBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📅</span>
                  Monthly Budget Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent: {formatCurrency(totalSpent)}</span>
                    <span className="text-gray-600">Limit: {formatCurrency(monthlyBudget)}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(monthlyBudgetProgress, 100)} 
                      className="h-4 bg-gray-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-md">
                        {monthlyBudgetProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {monthlyBudgetProgress > 100 
                      ? `🚨 ${(monthlyBudgetProgress - 100).toFixed(1)}% over monthly budget`
                      : `🎯 ${(100 - monthlyBudgetProgress).toFixed(1)}% remaining this month`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Budget Progress */}
        {totalBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏷️</span>
                  Category Budget Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent: {formatCurrency(totalSpent)}</span>
                    <span className="text-gray-600">Total: {formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(categoryBudgetProgress, 100)} 
                      className="h-4 bg-gray-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-md">
                        {categoryBudgetProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {categoryBudgetProgress > 100 
                      ? `🚨 ${(categoryBudgetProgress - 100).toFixed(1)}% over category budgets`
                      : `🎯 ${(100 - categoryBudgetProgress).toFixed(1)}% of budgets remaining`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button 
          onClick={() => setShowAddExpense(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 px-6 rounded-xl"
        >
          <span className="text-xl">💸</span>
          <span className="font-medium">Add Expense</span>
        </Button>
      </motion.div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span>
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense, index) => {
                  const category = categories.find(c => c.name === expense.category);
                  return (
                    <motion.div 
                      key={expense.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
                          style={{ backgroundColor: category?.color || 'oklch(0.5 0.1 200)' }}
                        >
                          {category?.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description || expense.category}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">💡</div>
                <p className="text-lg font-medium mb-2">No expenses yet this month</p>
                <p className="text-sm">Add your first expense to get started on your financial journey!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
}