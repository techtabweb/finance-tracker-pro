import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Expense, Budget, Category, DEFAULT_CATEGORIES } from '@/lib/types';
import { getCurrentMonth } from '@/lib/format';

export function useFinanceData() {
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', []);
  const [budgets, setBudgets] = useKV<Budget[]>('budgets', []);
  const [categories, setCategories] = useKV<Category[]>('categories', DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'budgets' | 'analytics'>('overview');

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    setExpenses((current) => [newExpense, ...current]);
    
    // Update budget spent amount
    setBudgets((current) => 
      current.map(budget => 
        budget.category === expense.category
          ? { ...budget, spent: budget.spent + expense.amount }
          : budget
      )
    );
  };

  const deleteExpense = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenses((current) => current.filter(e => e.id !== expenseId));
    
    // Update budget spent amount
    setBudgets((current) => 
      current.map(budget => 
        budget.category === expense.category
          ? { ...budget, spent: Math.max(0, budget.spent - expense.amount) }
          : budget
      )
    );
  };

  const setBudget = (category: string, limit: number) => {
    const currentMonthExpenses = expenses.filter(expense => 
      expense.category === category && 
      expense.date.startsWith(getCurrentMonth())
    );
    
    const spent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    setBudgets((current) => {
      const existingBudget = current.find(b => b.category === category);
      if (existingBudget) {
        return current.map(budget =>
          budget.category === category
            ? { ...budget, limit, spent }
            : budget
        );
      } else {
        return [...current, {
          id: Date.now().toString(),
          category,
          limit,
          spent,
        }];
      }
    });
  };

  const getCurrentMonthExpenses = () => {
    const currentMonth = getCurrentMonth();
    return expenses.filter(expense => expense.date.startsWith(currentMonth));
  };

  const getTotalSpent = () => {
    return getCurrentMonthExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.limit, 0);
  };

  return {
    expenses,
    budgets,
    categories,
    activeTab,
    setActiveTab,
    addExpense,
    deleteExpense,
    setBudget,
    getCurrentMonthExpenses,
    getTotalSpent,
    getTotalBudget,
  };
}