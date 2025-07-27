import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

interface SetMonthlyBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetMonthlyBudgetDialog({ open, onOpenChange }: SetMonthlyBudgetDialogProps) {
  const { monthlyBudget = 0, setMonthlyBudget, getTotalSpent } = useFinanceData();
  const [budgetAmount, setBudgetAmount] = useState((monthlyBudget || 0).toString());

  const totalSpent = getTotalSpent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budgetAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setMonthlyBudget(amount);
    toast.success(`Monthly budget ${amount === 0 ? 'removed' : 'set to ' + formatCurrency(amount)}`);
    
    onOpenChange(false);
  };

  // Update budget amount when dialog opens
  React.useEffect(() => {
    if (open) {
      setBudgetAmount(monthlyBudget.toString());
    }
  }, [open, monthlyBudget]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Budget Limit</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Set your overall monthly spending limit across all categories
            </p>
          </div>

          {monthlyBudget > 0 && (
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <h4 className="font-medium">Current Monthly Budget Status</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Current Monthly Limit:</span>
                  <span>{formatCurrency(monthlyBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent This Month:</span>
                  <span>{formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={monthlyBudget - totalSpent < 0 ? 'text-destructive' : ''}>
                    {formatCurrency(monthlyBudget - totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className={totalSpent > monthlyBudget ? 'text-destructive' : ''}>
                    {monthlyBudget > 0 ? ((totalSpent / monthlyBudget) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {monthlyBudget > 0 ? 'Update Budget' : 'Set Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}