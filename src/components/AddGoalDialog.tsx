import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const { addSavingsGoal } = useFinanceData();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !target || !deadline) {
      toast.error('Please fill in all fields');
      return;
    }

    const targetAmount = parseFloat(target);
    if (targetAmount <= 0) {
      toast.error('Target amount must be greater than 0');
      return;
    }

    if (new Date(deadline) <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    addSavingsGoal({
      name: name.trim(),
      target: targetAmount,
      current: 0,
      deadline,
      priority,
    });

    toast.success('Savings goal created successfully!');
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setTarget('');
    setDeadline('');
    setPriority('medium');
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund, New Laptop, Vacation"
              required
            />
          </div>

          <div>
            <Label htmlFor="target-amount">Target Amount (₹)</Label>
            <Input
              id="target-amount"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="deadline">Target Date</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDateString}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
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
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}