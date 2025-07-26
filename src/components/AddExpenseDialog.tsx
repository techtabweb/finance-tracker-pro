import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Calendar, Tag, FileText, IndianRupee } from '@phosphor-icons/react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { categories, addExpense } = useFinanceData();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      addExpense({
        amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      toast.success('💸 Expense added successfully!', {
        description: `${formData.category}: ₹${amount.toFixed(2)}`
      });
      
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto' : 'sm:max-w-lg'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">💸</span>
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Amount Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium">
              <IndianRupee className="w-4 h-4" />
              Amount *
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={`${isMobile ? 'h-12 text-lg' : 'h-11'} pl-8`}
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            </div>
          </motion.div>

          {/* Category Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4" />
              Category *
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className={`${isMobile ? 'h-12' : 'h-11'}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className={isMobile ? 'max-h-[200px]' : ''}>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-3 py-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Description Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What did you spend on? (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={isMobile ? 2 : 3}
              className="resize-none"
            />
          </motion.div>

          {/* Date Field */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`${isMobile ? 'h-12' : 'h-11'}`}
              required
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-3'} pt-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className={`${isMobile ? 'h-12 order-2' : 'h-11'} flex-1`}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`${isMobile ? 'h-12 order-1' : 'h-11'} flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Expense
                </div>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}