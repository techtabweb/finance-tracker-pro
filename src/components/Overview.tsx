import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, getMonthName, getCurrentMonth } from '@/lib/format';
import { AddExpenseDialog } from './AddExpenseDialog';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle } from '@phosphor-icons/react';

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
  const isMobile = useIsMobile();
  
  const totalSpent = getTotalSpent();
  const totalBudget = getTotalBudget();
  const categoryRemaining = totalBudget - totalSpent;
  const monthlyRemaining = monthlyBudget - totalSpent;
  const currentMonthExpenses = getCurrentMonthExpenses();
  const recentExpenses = currentMonthExpenses.slice(0, isMobile ? 2 : 3);

  const categoryBudgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const monthlyBudgetProgress = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const summaryCards = [
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      subtitle: getMonthName(getCurrentMonth()),
      icon: "💸",
      phosphorIcon: TrendingDown,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      textColor: "text-red-700",
      change: totalSpent > 0 ? "+₹" + totalSpent.toFixed(0) : "₹0"
    },
    {
      title: "Monthly Budget",
      value: monthlyBudget > 0 ? formatCurrency(monthlyBudget) : 'Not Set',
      subtitle: monthlyBudget > 0 
        ? (monthlyRemaining < 0 ? `₹${Math.abs(monthlyRemaining)} over` : `₹${monthlyRemaining} left`)
        : 'Set your monthly limit',
      icon: "🎯",
      phosphorIcon: Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-700",
      change: monthlyBudget > 0 ? "Active" : "Not Set"
    },
    {
      title: "Category Budgets",
      value: totalBudget > 0 ? formatCurrency(totalBudget) : 'Not Set',
      subtitle: totalBudget > 0 
        ? (categoryRemaining < 0 ? `₹${Math.abs(categoryRemaining)} over` : `₹${categoryRemaining} left`)
        : 'Set category limits',
      icon: "🏷️",
      phosphorIcon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
      change: budgets.length + " active"
    },
    {
      title: "Budget Status",
      value: (monthlyBudget > 0 && monthlyRemaining < 0) || (totalBudget > 0 && categoryRemaining < 0) 
        ? 'Over Budget' 
        : 'On Track',
      subtitle: monthlyBudget > 0 || totalBudget > 0 ? 'Budget tracking active' : 'No budgets set',
      icon: (monthlyBudget > 0 && monthlyRemaining < 0) || (totalBudget > 0 && categoryRemaining < 0) ? "⚠️" : "✅",
      phosphorIcon: (monthlyBudget > 0 && monthlyRemaining < 0) || (totalBudget > 0 && categoryRemaining < 0) ? AlertTriangle : Target,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      textColor: "text-purple-700",
      change: totalSpent > 0 ? Math.round((totalSpent / (monthlyBudget || totalBudget || 1)) * 100) + "%" : "0%"
    }
  ];
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section */}
      <motion.div 
        className="text-center py-6 sm:py-8 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Welcome to Your Financial Journey! 🚀
          </h2>
          <p className="text-white/90 text-sm sm:text-base">
            Track, manage, and grow your wealth with smart insights
          </p>
          {!isMobile && (
            <div className="mt-4 flex justify-center items-center gap-6 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="font-medium">{currentMonthExpenses.length} transactions</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="font-medium">{categories.length} categories</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -top-4 -right-4 text-4xl sm:text-6xl opacity-20">💰</div>
        <div className="absolute -bottom-4 -left-4 text-4xl sm:text-6xl opacity-20">📊</div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 card-hover">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor} opacity-20`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 relative">
                <CardTitle className={`text-xs sm:text-sm font-medium ${card.textColor}`}>
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl">{card.icon}</span>
                  {!isMobile && <card.phosphorIcon className={`w-4 h-4 ${card.textColor}`} />}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 relative">
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${card.textColor} mb-1`}>
                  {card.value}
                </div>
                <p className="text-xs text-gray-600 leading-tight">
                  {card.subtitle}
                </p>
                {!isMobile && (
                  <div className="mt-2 text-xs font-medium text-gray-500">
                    {card.change}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Budget Progress */}
      <div className={`grid grid-cols-1 ${!isMobile ? 'lg:grid-cols-2' : ''} gap-4 sm:gap-6`}>
        {/* Monthly Budget Progress */}
        {monthlyBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <span>📅</span>
                  Monthly Budget Progress
                  {monthlyBudgetProgress > 90 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent: <span className="font-medium">{formatCurrency(totalSpent)}</span></span>
                    <span className="text-gray-600">Limit: <span className="font-medium">{formatCurrency(monthlyBudget)}</span></span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(monthlyBudgetProgress, 100)} 
                      className="h-3 sm:h-4 bg-gray-200 progress-enhanced"
                    />
                    {monthlyBudgetProgress > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white drop-shadow-md">
                          {monthlyBudgetProgress.toFixed(0)}%
                        </span>
                      </div>
                    )}
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
            initial={{ opacity: 0, x: !isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <span>🏷️</span>
                  Category Budget Progress
                  {categoryBudgetProgress > 90 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent: <span className="font-medium">{formatCurrency(totalSpent)}</span></span>
                    <span className="text-gray-600">Total: <span className="font-medium">{formatCurrency(totalBudget)}</span></span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(categoryBudgetProgress, 100)} 
                      className="h-3 sm:h-4 bg-gray-200 progress-enhanced"
                    />
                    {categoryBudgetProgress > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white drop-shadow-md">
                          {categoryBudgetProgress.toFixed(0)}%
                        </span>
                      </div>
                    )}
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

      {/* Quick Actions & Add Expense Button */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button 
          onClick={() => setShowAddExpense(true)} 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-lg sm:text-xl mr-1">💸</span>
          <span>Add Expense</span>
        </Button>
        {!isMobile && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 rounded-xl">
            <Target className="w-4 h-4" />
            <span>Track your spending goals efficiently</span>
          </div>
        )}
      </motion.div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span className="text-base sm:text-lg">Recent Expenses</span>
              </div>
              {recentExpenses.length > 0 && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {currentMonthExpenses.length} total
                </div>
              )}
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
                      className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200 card-hover"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-bold shadow-md"
                          style={{ backgroundColor: category?.color || 'oklch(0.5 0.1 200)' }}
                        >
                          {category?.name.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {expense.description || expense.category}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-bold text-base sm:text-lg text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {currentMonthExpenses.length > recentExpenses.length && (
                  <motion.div 
                    className="text-center py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-gray-500">
                      And {currentMonthExpenses.length - recentExpenses.length} more transactions this month
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <div className="text-4xl sm:text-6xl mb-4">💡</div>
                <p className="text-base sm:text-lg font-medium mb-2">No expenses yet this month</p>
                <p className="text-sm">Add your first expense to get started on your financial journey!</p>
                <Button
                  onClick={() => setShowAddExpense(true)}
                  variant="outline"
                  className="mt-4 border-dashed border-2 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button
            onClick={() => setShowAddExpense(true)}
            className="fab bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
            size="lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
}