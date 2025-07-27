import { useKV } from '@github/spark/hooks';
import { Expense, Budget, SavingsGoal } from '@/lib/types';

export interface BackupHistory {
  id: string;
  date: string;
  type: 'export' | 'import';
  format: 'json' | 'csv';
  recordCount: number;
  size?: string;
}

export interface DataInsights {
  totalBackups: number;
  lastBackupDate?: string;
  oldestExpense?: string;
  newestExpense?: string;
  storageUsed: string;
  backupFrequency: 'never' | 'infrequent' | 'regular' | 'frequent';
  recommendations: string[];
}

export function useBackupInsights() {
  const [backupHistory, setBackupHistory] = useKV<BackupHistory[]>('backup-history', []);

  const addBackupRecord = (record: Omit<BackupHistory, 'id'>) => {
    const newRecord: BackupHistory = {
      ...record,
      id: Date.now().toString()
    };
    
    setBackupHistory((current) => [newRecord, ...(current || []).slice(0, 49)]); // Keep last 50 records
  };

  const getDataInsights = (
    expenses: Expense[],
    budgets: Budget[],
    goals: SavingsGoal[]
  ): DataInsights => {
    const totalRecords = expenses.length + budgets.length + goals.length;
    const sortedExpenses = expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const lastBackup = backupHistory.find(b => b.type === 'export');
    const daysSinceLastBackup = lastBackup 
      ? Math.floor((Date.now() - new Date(lastBackup.date).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    let backupFrequency: DataInsights['backupFrequency'] = 'never';
    if (backupHistory.filter(b => b.type === 'export').length === 0) {
      backupFrequency = 'never';
    } else if (daysSinceLastBackup <= 7) {
      backupFrequency = 'frequent';
    } else if (daysSinceLastBackup <= 30) {
      backupFrequency = 'regular';
    } else {
      backupFrequency = 'infrequent';
    }

    const recommendations: string[] = [];
    
    if (backupFrequency === 'never' && totalRecords > 10) {
      recommendations.push('Create your first backup to protect your financial data');
    }
    
    if (backupFrequency === 'infrequent' && totalRecords > 50) {
      recommendations.push('Consider backing up more frequently - monthly backups are recommended');
    }
    
    if (expenses.length > 500) {
      recommendations.push('Clean up old expenses to improve app performance');
    }
    
    if (sortedExpenses.length > 0) {
      const oldestDate = new Date(sortedExpenses[0].date);
      const monthsOld = (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld > 24) {
        recommendations.push('Archive expenses older than 2 years to optimize storage');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Your data management looks great! Keep up the good backup habits.');
    }

    return {
      totalBackups: backupHistory.filter(b => b.type === 'export').length,
      lastBackupDate: lastBackup?.date,
      oldestExpense: sortedExpenses.length > 0 ? sortedExpenses[0].date : undefined,
      newestExpense: sortedExpenses.length > 0 ? sortedExpenses[sortedExpenses.length - 1].date : undefined,
      storageUsed: `${Math.round(totalRecords * 0.1)}MB`,
      backupFrequency,
      recommendations
    };
  };

  return {
    backupHistory,
    addBackupRecord,
    getDataInsights
  };
}