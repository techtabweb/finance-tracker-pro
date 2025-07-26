import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddToGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
}

export function AddToGoalDialog({ open, onOpenChange, goalId }: AddToGoalDialogProps) {
  const { savingsGoals, updateSavingsGoal } = useFinanceData();
  const [amount, setAmount] = useState('');

  const goal = savingsGoals.find(g => g.id === goalId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !goal) {
      toast.error('Please enter a valid amount');
      return;
    }

    const addAmount = parseFloat(amount);
    if (addAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (goal.current + addAmount > goal.target) {
      toast.error('Amount would exceed the goal target');
      return;
    }

    updateSavingsGoal(goalId, addAmount);
    
    const newCurrent = goal.current + addAmount;
    if (newCurrent >= goal.target) {
      toast.success('🎉 Congratulations! Goal completed!');
    } else {
      toast.success('Amount added successfully!');
    }
    
    setAmount('');
    onOpenChange(false);
  };

  if (!goal) return null;

  const remaining = goal.target - goal.current;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Money to Goal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-secondary p-4 rounded-lg">
            <h4 className="font-medium">{goal.name}</h4>
            <div className="text-sm text-muted-foreground mt-1">
              <p>Current: {formatCurrency(goal.current)}</p>
              <p>Target: {formatCurrency(goal.target)}</p>
              <p>Remaining: {formatCurrency(remaining)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="add-amount">Amount to Add (₹)</Label>
              <Input
                id="add-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0.01"
                max={remaining}
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {formatCurrency(remaining)}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Money
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}