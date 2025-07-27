import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useCategoryLearning } from '@/hooks/use-category-learning';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { SmartCategorizer } from '@/components/SmartCategorizer';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Calendar, Tag, FileText, IndianRupee, PencilSimple, Scan } from '@phosphor-icons/react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { categories, addExpense } = useFinanceData();
  const { recordCategoryCorrection } = useCategoryLearning();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract merchant name from description for better categorization
  const extractMerchant = (description: string): string => {
    if (!description) return '';
    
    // Look for common patterns that indicate merchant names
    const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length > 0) {
      // First line is often the merchant name
      const firstLine = lines[0];
      
      // Remove common expense-related words to get cleaner merchant name
      const cleanedMerchant = firstLine
        .replace(/\b(bought|purchased|paid|at|from|for|bill|payment|expense)\b/gi, '')
        .replace(/[₹$£€]\d+.*/, '') // Remove amounts
        .replace(/\d{4}[-/]\d{2}[-/]\d{2}/, '') // Remove dates
        .trim();
      
      return cleanedMerchant || firstLine;
    }
    
    return description.substring(0, 50); // Fallback to first 50 characters
  };

  const handleExpenseScanned = (scannedExpense: any) => {
    setFormData({
      amount: scannedExpense.amount.toString(),
      category: scannedExpense.category,
      description: scannedExpense.merchant + (scannedExpense.items ? ' - ' + scannedExpense.items.join(', ') : ''),
      date: scannedExpense.date,
    });
    setActiveTab('manual');
    toast.success('✨ Receipt details filled automatically!', {
      description: 'Review and submit your expense'
    });
  };

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
      setActiveTab('manual');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-lg w-[95vw] max-w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto ${isMobile ? 'rounded-t-2xl rounded-b-none fixed bottom-0 top-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">💸</span>
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              {isMobile ? 'Scan' : 'Scan Receipt'}
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <PencilSimple className="w-4 h-4" />
              {isMobile ? 'Manual' : 'Manual Entry'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <ReceiptScanner 
              onExpenseScanned={handleExpenseScanned}
              onScanningStateChange={setIsScanning}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-5">
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
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
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

            {/* Smart Categorizer */}
            {formData.description && (
              <SmartCategorizer
                description={formData.description}
                merchant={extractMerchant(formData.description)}
                categories={categories}
                onCategorySelect={(category) => setFormData(prev => ({ ...prev, category }))}
                selectedCategory={formData.category}
                onLearningRecord={(category, aiSuggestion, confidence) => {
                  // This will be called when user selects a category, recording learning patterns
                  console.log('Learning recorded:', { category, aiSuggestion, confidence });
                }}
              />
            )}
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
      </TabsContent>
    </Tabs>
      </DialogContent>
    </Dialog>
  );
}