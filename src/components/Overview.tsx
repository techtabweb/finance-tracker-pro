import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, getMonthName, getCurrentMonth } from '@/lib/format';
import { AddExpenseDialog } from './AddExpenseDialog';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign } from '@phosphor-icons/react';

export function Overview() {
  const { 
    getCurrentMonthExpenses, 
    getTotalSpent, 
    getTotalBudget, 
    budgets,
    categories 
  } = useFinanceData();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const totalSpent = getTotalSpent();
  const totalBudget = getTotalBudget();
  const remaining = totalBudget - totalSpent;
  const currentMonthExpenses = getCurrentMonthExpenses();
  const recentExpenses = currentMonthExpenses.slice(0, 3);

  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {getMonthName(getCurrentMonth())}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly limit
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(remaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining < 0 ? 'Over budget' : 'Available to spend'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {totalBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Spent: {formatCurrency(totalSpent)}</span>
                <span>Budget: {formatCurrency(totalBudget)}</span>
              </div>
              <Progress 
                value={Math.min(budgetProgress, 100)} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {budgetProgress > 100 
                  ? `${(budgetProgress - 100).toFixed(1)}% over budget`
                  : `${(100 - budgetProgress).toFixed(1)}% remaining`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Add Expense
        </Button>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const category = categories.find(c => c.name === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: category?.color || 'oklch(0.5 0.1 200)' }}
                      >
                        {category?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{expense.description || expense.category}</p>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expenses yet this month</p>
              <p className="text-sm">Add your first expense to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense}
      />
    </div>
  );
}