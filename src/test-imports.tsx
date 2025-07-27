// Test file to verify all critical imports work
// This file helps identify import or dependency issues

import React from 'react';

// Core hooks
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';

// Main components
import { Overview } from '@/components/Overview';
import { ExpensesList } from '@/components/ExpensesList';
import { BudgetsList } from '@/components/BudgetsList';

// Utilities
import { formatCurrency } from '@/lib/format';
import { Expense, Budget } from '@/lib/types';

// Motion
import { motion } from 'framer-motion';

// Toast
import { toast } from 'sonner';

export function ImportTest() {
  // Test hooks
  const { expenses = [], budgets = [] } = useFinanceData();
  const { applyTheme } = useTheme();
  const isMobile = useIsMobile();

  // Test format functions
  const testAmount = formatCurrency(1000);

  return (
    <div>
      <h1>Import Test Successful</h1>
      <p>All imports work correctly</p>
      <p>Expenses: {expenses.length}</p>
      <p>Budgets: {budgets.length}</p>
      <p>Test amount: {testAmount}</p>
      <p>Is mobile: {isMobile ? 'Yes' : 'No'}</p>
      <Button onClick={() => toast.success('Test successful')}>
        Test Button
      </Button>
    </div>
  );
}

export default ImportTest;