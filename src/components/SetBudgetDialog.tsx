import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetBudgetDialog({ open, onOpenChange }: SetBudgetDialogProps) {
  const { categories, budgets, setBudget } = useFinanceData();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const currentBudget = budgets.find(b => b.category === selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !budgetAmount) {
      toast.error('Please select a category and enter an amount');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setBudget(selectedCategory, amount);
    toast.success(`Budget set for ${selectedCategory}`);
    
    setSelectedCategory('');
    setBudgetAmount('');
    onOpenChange(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const existingBudget = budgets.find(b => b.category === category);
    if (existingBudget) {
      setBudgetAmount(existingBudget.limit.toString());
    } else {
      setBudgetAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
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

          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Budget</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
          </div>

          {currentBudget && (
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <h4 className="font-medium">Current Budget Status</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Current Limit:</span>
                  <span>{formatCurrency(currentBudget.limit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent This Month:</span>
                  <span>{formatCurrency(currentBudget.spent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={currentBudget.limit - currentBudget.spent < 0 ? 'text-destructive' : ''}>
                    {formatCurrency(currentBudget.limit - currentBudget.spent)}
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
              {currentBudget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}