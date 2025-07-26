export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

export interface EMI {
  id: string;
  name: string;
  monthlyAmount: number;
  totalAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  category: 'loan' | 'credit-card' | 'other';
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'Coffee', color: 'oklch(0.6 0.15 30)' },
  { id: '2', name: 'Transportation', icon: 'Car', color: 'oklch(0.55 0.12 240)' },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', color: 'oklch(0.7 0.18 320)' },
  { id: '4', name: 'Entertainment', icon: 'GameController', color: 'oklch(0.65 0.15 280)' },
  { id: '5', name: 'Bills & Utilities', icon: 'House', color: 'oklch(0.5 0.1 180)' },
  { id: '6', name: 'Healthcare', icon: 'Heart', color: 'oklch(0.6 0.18 10)' },
  { id: '7', name: 'Education', icon: 'GraduationCap', color: 'oklch(0.55 0.12 200)' },
  { id: '8', name: 'Travel', icon: 'Airplane', color: 'oklch(0.6 0.15 120)' },
  { id: '9', name: 'Groceries', icon: 'ShoppingCart', color: 'oklch(0.65 0.15 90)' },
  { id: '10', name: 'Mobile & Internet', icon: 'DeviceMobile', color: 'oklch(0.5 0.12 260)' },
  { id: '11', name: 'Fuel', icon: 'Drop', color: 'oklch(0.45 0.15 50)' },
  { id: '12', name: 'Maintenance', icon: 'Wrench', color: 'oklch(0.55 0.1 160)' },
];