import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { SetBudgetDialog } from './SetBudgetDialog';
import { SetMonthlyBudgetDialog } from './SetMonthlyBudgetDialog';
import { motion } from 'framer-motion';

export function BudgetsList() {
  const { budgets, categories, monthlyBudget, getTotalBudget, getTotalSpent } = useFinanceData();
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [showSetMonthlyBudget, setShowSetMonthlyBudget] = useState(false);

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();

  const budgetsWithCategories = budgets.map(budget => ({
    ...budget,
    category_info: categories.find(c => c.name === budget.category)
  }));

  const unbudgetedCategories = categories.filter(
    category => !budgets.some(budget => budget.category === category.name)
  );

  const categoryEmojis: { [key: string]: string } = {
    'Food & Dining': '🍽️',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Healthcare': '🏥',
    'Education': '📚',
    'Bills & Utilities': '📄',
    'Groceries': '🛒',
    'Mobile & Internet': '📱',
    'Fuel': '⛽',
    'Maintenance': '🔧',
    'Travel': '✈️',
    'Other': '📦'
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
            <span>💰</span>
            Budget Manager
          </h2>
          <p className="text-gray-600 text-sm mt-1">Set and track your spending limits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowSetMonthlyBudget(true)} 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg h-12 px-6 rounded-xl"
          >
            <span className="text-xl mr-2">🎯</span>
            Monthly Budget
          </Button>
          <Button 
            onClick={() => setShowSetBudget(true)} 
            variant="outline" 
            className="h-12 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300"
          >
            <span className="text-xl mr-2">➕</span>
            Category Budget
          </Button>
        </div>
      </motion.div>

      {/* Monthly Budget Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Monthly Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyBudget > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50">
                      <p className="text-sm text-blue-600 mb-1">Monthly Limit</p>
                      <p className="text-xl font-bold text-blue-900">{formatCurrency(monthlyBudget)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50">
                      <p className="text-sm text-orange-600 mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-orange-900">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${monthlyBudget - totalSpent < 0 
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50'
                    }`}>
                      <p className={`text-sm mb-1 ${monthlyBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {monthlyBudget - totalSpent < 0 ? 'Over Budget' : 'Remaining'}
                      </p>
                      <p className={`text-xl font-bold ${monthlyBudget - totalSpent < 0 ? 'text-red-900' : 'text-green-900'}`}>
                        {formatCurrency(Math.abs(monthlyBudget - totalSpent))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Progress 
                        value={Math.min((totalSpent / monthlyBudget) * 100, 100)} 
                        className="h-6 bg-gray-200"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-white drop-shadow-md">
                          {((totalSpent / monthlyBudget) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {totalSpent > monthlyBudget 
                        ? `🚨 ${((totalSpent / monthlyBudget - 1) * 100).toFixed(1)}% over monthly budget`
                        : `✅ ${(100 - (totalSpent / monthlyBudget) * 100).toFixed(1)}% of monthly budget remaining`
                      }
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSetMonthlyBudget(true)}
                    className="w-full h-10 rounded-xl"
                  >
                    <span className="mr-2">✏️</span>
                    Update Monthly Budget
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium mb-2">No monthly budget set</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Set an overall monthly spending limit to track your total expenses and stay within your means
                  </p>
                  <Button 
                    onClick={() => setShowSetMonthlyBudget(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg h-12 px-8 rounded-xl"
                  >
                    <span className="text-xl mr-2">🎯</span>
                    Set Monthly Budget
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Budget Summary */}
      {budgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                Category Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200/50">
                  <p className="text-sm text-purple-600 mb-1">Total Budgets</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50">
                  <p className="text-sm text-orange-600 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(totalSpent)}</p>
                </div>
                <div className={`p-4 rounded-xl border ${totalBudget - totalSpent < 0 
                  ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50'
                }`}>
                  <p className={`text-sm mb-1 ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalBudget - totalSpent < 0 ? 'Over Budget' : 'Remaining'}
                  </p>
                  <p className={`text-xl font-bold ${totalBudget - totalSpent < 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {formatCurrency(Math.abs(totalBudget - totalSpent))}
                  </p>
                </div>
              </div>
              
              {totalBudget > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="relative">
                    <Progress 
                      value={Math.min((totalSpent / totalBudget) * 100, 100)} 
                      className="h-6 bg-gray-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white drop-shadow-md">
                        {((totalSpent / totalBudget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {totalSpent > totalBudget 
                      ? `🚨 ${((totalSpent / totalBudget - 1) * 100).toFixed(1)}% over category budgets`
                      : `✅ ${(100 - (totalSpent / totalBudget) * 100).toFixed(1)}% of budgets remaining`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Individual Budgets */}
      {budgetsWithCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Category Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetsWithCategories.map((budget, index) => {
                  const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                  const isOverBudget = budget.spent > budget.limit;
                  
                  return (
                    <motion.div 
                      key={budget.id} 
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">{categoryEmojis[budget.category] || '📦'}</span>
                            <div 
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: budget.category_info?.color || 'oklch(0.5 0.1 200)' }}
                            />
                          </div>
                          <span className="font-medium text-gray-900">{budget.category}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSetBudget(true)}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Spent: <span className="font-medium">{formatCurrency(budget.spent)}</span>
                          </span>
                          <span className="text-gray-600">
                            Budget: <span className="font-medium">{formatCurrency(budget.limit)}</span>
                          </span>
                        </div>
                        
                        <div className="relative">
                          <Progress 
                            value={Math.min(progress, 100)} 
                            className={`h-4 bg-gray-200 ${isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-md">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {progress.toFixed(1)}% used
                          </span>
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverBudget 
                              ? `${formatCurrency(budget.spent - budget.limit)} over 🚨`
                              : `${formatCurrency(budget.limit - budget.spent)} left ✅`
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Unbudgeted Categories */}
      {unbudgetedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Categories Without Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unbudgetedCategories.map((category, index) => (
                  <motion.div 
                    key={category.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">{categoryEmojis[category.name] || '📦'}</span>
                        <div 
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSetBudget(true)}
                      className="bg-white hover:bg-gray-50 border-orange-300 text-orange-700 hover:text-orange-800 rounded-lg"
                    >
                      <span className="mr-1">💰</span>
                      Set Budget
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {budgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-medium mb-3">No budgets set yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Set budgets for your categories to track your spending goals and stay financially disciplined
              </p>
              <Button 
                onClick={() => setShowSetBudget(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 px-8 rounded-xl"
              >
                <span className="text-xl mr-2">💰</span>
                Set Your First Budget
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <SetBudgetDialog 
        open={showSetBudget} 
        onOpenChange={setShowSetBudget}
      />
      
      <SetMonthlyBudgetDialog 
        open={showSetMonthlyBudget} 
        onOpenChange={setShowSetMonthlyBudget}
      />
    </div>
  );
}