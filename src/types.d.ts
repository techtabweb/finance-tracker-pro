// Type declarations for the application

// Global spark interface for standalone deployment
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
  
  const spark: Window['spark'];
}

// Export types for use in components
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
}