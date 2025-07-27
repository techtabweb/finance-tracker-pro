import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, formatDate } from '@/lib/format';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AIInsights } from './AIInsights';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function ExpensesList() {
  const { expenses = [], categories = [], deleteExpense } = useFinanceData();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
    toast.success('💸 Expense deleted successfully!');
  };

  const categoryEmojis: { [key: string]: string } = {
    'Food': '🍽️',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Healthcare': '🏥',
    'Education': '📚',
    'Bills': '📄',
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <span>💸</span>
            Expenses Tracker
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage and track all your spending</p>
        </div>
        <Button 
          onClick={() => setShowAddExpense(true)} 
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 px-6 rounded-xl w-full sm:w-auto"
        >
          <span className="text-xl mr-2">➕</span>
          Add Expense
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-0 bg-muted focus:bg-card transition-colors"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-0 bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      All Categories
                    </div>
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <span>{categoryEmojis[category.name] || '📦'}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white/80 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold">{filteredExpenses.length}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Average per Transaction</p>
                <p className="text-2xl font-bold">
                  {filteredExpenses.length > 0 
                    ? formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) / filteredExpenses.length)
                    : '₹0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <AIInsights />
      </motion.div>

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span>📋</span>
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'Expense' : 'Expenses'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredExpenses.map((expense, index) => {
                    const category = categories.find(c => c.name === expense.category);
                    return (
                      <motion.div 
                        key={expense.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border/50 hover:shadow-md transition-all duration-200 card-hover"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        layout
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">{categoryEmojis[expense.category] || '📦'}</span>
                            <div 
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: category?.color || 'oklch(0.5 0.1 200)' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate text-sm sm:text-base">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {expense.category} • {formatDate(expense.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-right">
                            <p className="font-bold text-lg text-foreground">{formatCurrency(expense.amount)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 p-0"
                          >
                            <span className="text-lg">🗑️</span>
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                className="text-center py-12 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">
                  {searchTerm || selectedCategory !== 'all' ? '🔍' : '💸'}
                </div>
                <p className="text-lg font-medium mb-2 text-foreground">
                  {searchTerm || selectedCategory !== 'all' ? 'No expenses found' : 'No expenses yet'}
                </p>
                <p className="text-sm">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first expense to start tracking your spending!'
                  }
                </p>
              </motion.div>
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