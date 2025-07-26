import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { SetBudgetDialog } from './SetBudgetDialog';
import { Plus, Target } from '@phosphor-icons/react';

export function BudgetsList() {
  const { budgets, categories, getTotalBudget, getTotalSpent } = useFinanceData();
  const [showSetBudget, setShowSetBudget] = useState(false);

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();

  const budgetsWithCategories = budgets.map(budget => ({
    ...budget,
    category_info: categories.find(c => c.name === budget.category)
  }));

  const unbudgetedCategories = categories.filter(
    category => !budgets.some(budget => budget.category === category.name)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Budgets</h2>
        <Button onClick={() => setShowSetBudget(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Set Budget
        </Button>
      </div>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={24} />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Budget:</span>
              <span className="font-semibold text-lg">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Spent:</span>
              <span className="font-semibold text-lg">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Remaining:</span>
              <span className={`font-semibold text-lg ${totalBudget - totalSpent < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(totalBudget - totalSpent)}
              </span>
            </div>
            {totalBudget > 0 && (
              <div className="space-y-2">
                <Progress 
                  value={Math.min((totalSpent / totalBudget) * 100, 100)} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget used
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Budgets */}
      {budgetsWithCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetsWithCategories.map((budget) => {
                const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                const isOverBudget = budget.spent > budget.limit;
                
                return (
                  <div key={budget.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: budget.category_info?.color || 'oklch(0.5 0.1 200)' }}
                        >
                          {budget.category.charAt(0)}
                        </div>
                        <span className="font-medium">{budget.category}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSetBudget(true)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Spent: {formatCurrency(budget.spent)}
                        </span>
                        <span className="text-muted-foreground">
                          Budget: {formatCurrency(budget.limit)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                      />
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          {progress.toFixed(1)}% used
                        </span>
                        <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {isOverBudget 
                            ? `${formatCurrency(budget.spent - budget.limit)} over`
                            : `${formatCurrency(budget.limit - budget.spent)} remaining`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unbudgeted Categories */}
      {unbudgetedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories Without Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unbudgetedCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSetBudget(true)}
                  >
                    Set Budget
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No budgets set</h3>
            <p className="text-muted-foreground mb-4">
              Set budgets for your categories to track your spending goals
            </p>
            <Button onClick={() => setShowSetBudget(true)}>
              Set Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}

      <SetBudgetDialog 
        open={showSetBudget} 
        onOpenChange={setShowSetBudget}
      />
    </div>
  );
}