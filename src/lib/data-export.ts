import { Expense, Budget, Category, SavingsGoal, EMI, Achievement, WellnessScore, PersonalizedTip, CategoryLearningPattern } from './types';

export interface FinanceDataExport {
  version: string;
  exportDate: string;
  data: {
    expenses: Expense[];
    budgets: Budget[];
    categories: Category[];
    savingsGoals: SavingsGoal[];
    monthlyBudget: number;
    emis?: EMI[];
    achievements?: Achievement[];
    wellnessScore?: WellnessScore;
    personalizedTips?: PersonalizedTip[];
    learningPatterns?: CategoryLearningPattern[];
  };
  metadata: {
    totalExpenses: number;
    totalBudgets: number;
    totalCategories: number;
    totalGoals: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}

export class FinanceDataManager {
  static exportData(data: FinanceDataExport['data']): FinanceDataExport {
    const expenses = data.expenses || [];
    const sortedExpenses = expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const exportData: FinanceDataExport = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data,
      metadata: {
        totalExpenses: expenses.length,
        totalBudgets: (data.budgets || []).length,
        totalCategories: (data.categories || []).length,
        totalGoals: (data.savingsGoals || []).length,
        dateRange: {
          earliest: sortedExpenses.length > 0 ? sortedExpenses[0].date : '',
          latest: sortedExpenses.length > 0 ? sortedExpenses[sortedExpenses.length - 1].date : ''
        }
      }
    };

    return exportData;
  }

  static exportToJSON(data: FinanceDataExport['data']): string {
    const exportData = this.exportData(data);
    return JSON.stringify(exportData, null, 2);
  }

  static exportToCSV(expenses: Expense[]): string {
    if (expenses.length === 0) {
      return 'Date,Amount,Category,Description\n';
    }

    const headers = 'Date,Amount,Category,Description\n';
    const rows = expenses.map(expense => {
      const amount = expense.amount.toString();
      const description = `"${expense.description.replace(/"/g, '""')}"`;
      return `${expense.date},${amount},${expense.category},${description}`;
    }).join('\n');

    return headers + rows;
  }

  static async downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static validateImportData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check basic structure
    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format. Expected JSON object.');
      return { isValid: false, errors };
    }

    // Check version compatibility
    if (!data.version) {
      errors.push('Missing version information.');
    }

    // Check data structure
    if (!data.data || typeof data.data !== 'object') {
      errors.push('Missing or invalid data section.');
      return { isValid: false, errors };
    }

    const { data: importData } = data;

    // Validate expenses
    if (importData.expenses && Array.isArray(importData.expenses)) {
      importData.expenses.forEach((expense: any, index: number) => {
        if (!expense.id || !expense.amount || !expense.category || !expense.description || !expense.date) {
          errors.push(`Invalid expense at index ${index}: missing required fields.`);
        }
        if (typeof expense.amount !== 'number' || expense.amount < 0) {
          errors.push(`Invalid expense amount at index ${index}.`);
        }
        if (!Date.parse(expense.date)) {
          errors.push(`Invalid date format in expense at index ${index}.`);
        }
      });
    }

    // Validate budgets
    if (importData.budgets && Array.isArray(importData.budgets)) {
      importData.budgets.forEach((budget: any, index: number) => {
        if (!budget.id || !budget.category || typeof budget.limit !== 'number') {
          errors.push(`Invalid budget at index ${index}: missing required fields.`);
        }
        if (budget.limit < 0 || budget.spent < 0) {
          errors.push(`Invalid budget amounts at index ${index}.`);
        }
      });
    }

    // Validate categories
    if (importData.categories && Array.isArray(importData.categories)) {
      importData.categories.forEach((category: any, index: number) => {
        if (!category.id || !category.name || !category.icon || !category.color) {
          errors.push(`Invalid category at index ${index}: missing required fields.`);
        }
      });
    }

    // Validate savings goals
    if (importData.savingsGoals && Array.isArray(importData.savingsGoals)) {
      importData.savingsGoals.forEach((goal: any, index: number) => {
        if (!goal.id || !goal.name || typeof goal.target !== 'number' || typeof goal.current !== 'number') {
          errors.push(`Invalid savings goal at index ${index}: missing required fields.`);
        }
        if (goal.target < 0 || goal.current < 0) {
          errors.push(`Invalid savings goal amounts at index ${index}.`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  static parseImportData(data: FinanceDataExport): {
    expenses: Expense[];
    budgets: Budget[];
    categories: Category[];
    savingsGoals: SavingsGoal[];
    monthlyBudget: number;
    emis?: EMI[];
    achievements?: Achievement[];
    wellnessScore?: WellnessScore;
    personalizedTips?: PersonalizedTip[];
    learningPatterns?: CategoryLearningPattern[];
  } {
    return {
      expenses: data.data.expenses || [],
      budgets: data.data.budgets || [],
      categories: data.data.categories || [],
      savingsGoals: data.data.savingsGoals || [],
      monthlyBudget: data.data.monthlyBudget || 0,
      emis: data.data.emis,
      achievements: data.data.achievements,
      wellnessScore: data.data.wellnessScore,
      personalizedTips: data.data.personalizedTips,
      learningPatterns: data.data.learningPatterns
    };
  }

  static generateBackupFilename(type: 'json' | 'csv'): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    if (type === 'csv') {
      return `finance-expenses-${dateStr}-${timeStr}.csv`;
    }
    
    return `finance-backup-${dateStr}-${timeStr}.json`;
  }

  static async parseCSVFile(file: File): Promise<Expense[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const expenses: Expense[] = [];
          
          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            if (values.length >= 4) {
              const [date, amount, category, description] = values;
              
              expenses.push({
                id: Date.now().toString() + i.toString(),
                date: date,
                amount: parseFloat(amount),
                category: category,
                description: description.replace(/^"|"$/g, '').replace(/""/g, '"')
              });
            }
          }
          
          resolve(expenses);
        } catch (error) {
          reject(new Error('Failed to parse CSV file: ' + error));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }
}