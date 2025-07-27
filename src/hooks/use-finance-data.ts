import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Expense, Budget, Category, SavingsGoal, DEFAULT_CATEGORIES } from '@/lib/types';
import { getCurrentMonth } from '@/lib/format';

export function useFinanceData() {
  // Use simple keys without user isolation since we removed auth
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', []);
  const [budgets, setBudgets] = useKV<Budget[]>('budgets', []);
  const [categories, setCategories] = useKV<Category[]>('categories', DEFAULT_CATEGORIES);
  const [savingsGoals, setSavingsGoals] = useKV<SavingsGoal[]>('savings-goals', []);
  const [monthlyBudget, setMonthlyBudget] = useKV<number>('monthly-budget', 0);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'budgets' | 'analytics' | 'goals' | 'wellness' | 'learning' | 'reports' | 'profile'>('overview');

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    try {
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
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const deleteExpense = (expenseId: string) => {
    try {
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) {
        console.warn('Expense not found for deletion:', expenseId);
        return;
      }

      setExpenses((current) => current.filter(e => e.id !== expenseId));
      
      // Update budget spent amount
      setBudgets((current) => 
        current.map(budget => 
          budget.category === expense.category
            ? { ...budget, spent: Math.max(0, budget.spent - expense.amount) }
            : budget
        )
      );
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error; // Re-throw so the UI can handle it
    }
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

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setSavingsGoals((current) => [newGoal, ...current]);
  };

  const updateSavingsGoal = (goalId: string, amount: number) => {
    setSavingsGoals((current) =>
      current.map(goal =>
        goal.id === goalId
          ? { ...goal, current: Math.min(goal.target, goal.current + amount) }
          : goal
      )
    );
  };

  const deleteSavingsGoal = (goalId: string) => {
    setSavingsGoals((current) => current.filter(goal => goal.id !== goalId));
  };

  return {
    expenses,
    budgets,
    categories,
    savingsGoals,
    monthlyBudget,
    activeTab,
    setActiveTab,
    setMonthlyBudget,
    addExpense,
    deleteExpense,
    setBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getCurrentMonthExpenses,
    getTotalSpent,
    getTotalBudget,
  };
}