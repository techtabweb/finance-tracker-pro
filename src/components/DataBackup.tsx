import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Upload, FileText, Database, AlertTriangle, CheckCircle, Info, FileSpreadsheet, Trash, Archive, Calendar } from '@phosphor-icons/react';
import { useFinanceData } from '@/hooks/use-finance-data';
import { FinanceDataManager, FinanceDataExport } from '@/lib/data-export';
import { useBackupInsights } from '@/hooks/use-backup-insights';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function DataBackup() {
  const {
    expenses,
    budgets,
    categories,
    savingsGoals,
    monthlyBudget,
    setExpenses,
    setBudgets,
    setCategories,
    setSavingsGoals,
    setMonthlyBudget
  } = useFinanceData();

  const { addBackupRecord, getDataInsights } = useBackupInsights();
  const dataInsights = getDataInsights(expenses, budgets, savingsGoals);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importPreview, setImportPreview] = useState<FinanceDataExport | null>(null);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [cleanupOptions, setCleanupOptions] = useState({
    olderThan: '1year',
    categories: [] as string[],
    includeExpenses: true,
    includeBudgets: false,
    includeGoals: false
  });

  const [importOptions, setImportOptions] = useState({
    replaceExisting: false,
    includeExpenses: true,
    includeBudgets: true,
    includeCategories: true,
    includeGoals: true,
    includeSettings: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const exportData = {
    expenses,
    budgets,
    categories,
    savingsGoals,
    monthlyBudget
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const jsonData = FinanceDataManager.exportToJSON(exportData);
      const filename = FinanceDataManager.generateBackupFilename('json');
      
      await FinanceDataManager.downloadFile(jsonData, filename, 'application/json');
      
      // Record backup history
      addBackupRecord({
        date: new Date().toISOString(),
        type: 'export',
        format: 'json',
        recordCount: totalRecords
      });
      
      toast.success('📄 Data exported successfully!', {
        description: `Backup saved as ${filename}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvData = FinanceDataManager.exportToCSV(expenses);
      const filename = FinanceDataManager.generateBackupFilename('csv');
      
      await FinanceDataManager.downloadFile(csvData, filename, 'text/csv');
      
      // Record backup history
      addBackupRecord({
        date: new Date().toISOString(),
        type: 'export',
        format: 'csv',
        recordCount: expenses.length
      });
      
      toast.success('📊 Expenses exported to CSV!', {
        description: `File saved as ${filename}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(10);
      setValidationErrors([]);

      const text = await file.text();
      setImportProgress(30);

      const data = JSON.parse(text);
      setImportProgress(50);

      const validation = FinanceDataManager.validateImportData(data);
      setImportProgress(70);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('❌ Import validation failed', {
          description: `Found ${validation.errors.length} errors in the backup file`
        });
        return;
      }

      setImportProgress(90);
      setImportPreview(data);
      setShowPreviewDialog(true);
      setImportProgress(100);

      toast.success('✅ Backup file validated successfully!', {
        description: 'Review the data before importing'
      });
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to read backup file', {
        description: 'Please ensure the file is a valid JSON backup'
      });
      setValidationErrors(['Invalid JSON file format']);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(10);

      const importedExpenses = await FinanceDataManager.parseCSVFile(file);
      setImportProgress(50);

      if (importedExpenses.length === 0) {
        toast.error('No expenses found in CSV file');
        return;
      }

      // Merge with existing expenses
      setExpenses((current) => {
        const existingIds = new Set(current.map(e => e.id));
        const newExpenses = importedExpenses.filter(e => !existingIds.has(e.id));
        setImportProgress(90);
        
        toast.success(`📊 Imported ${newExpenses.length} expenses from CSV!`, {
          description: `${importedExpenses.length - newExpenses.length} duplicates were skipped`
        });
        
        setImportProgress(100);
        return [...current, ...newExpenses];
      });
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('Failed to import CSV file', {
        description: 'Please ensure the CSV format is correct'
      });
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  const totalRecords = expenses.length + budgets.length + categories.length + savingsGoals.length;
  const oldExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return expenseDate < sixMonthsAgo;
  }).length;
    if (!importPreview) return;

    try {
      setIsImporting(true);
      setImportProgress(10);

      const parsedData = FinanceDataManager.parseImportData(importPreview);
      setImportProgress(30);

      // Import data based on user options
      if (importOptions.includeExpenses && parsedData.expenses.length > 0) {
        if (importOptions.replaceExisting) {
          setExpenses(parsedData.expenses);
        } else {
          setExpenses((current) => {
            const existingIds = new Set(current.map(e => e.id));
            const newExpenses = parsedData.expenses.filter(e => !existingIds.has(e.id));
            return [...current, ...newExpenses];
          });
        }
      }
      setImportProgress(45);

      if (importOptions.includeBudgets && parsedData.budgets.length > 0) {
        if (importOptions.replaceExisting) {
          setBudgets(parsedData.budgets);
        } else {
          setBudgets((current) => {
            const existingIds = new Set(current.map(b => b.id));
            const newBudgets = parsedData.budgets.filter(b => !existingIds.has(b.id));
            return [...current, ...newBudgets];
          });
        }
      }
      setImportProgress(60);

      if (importOptions.includeCategories && parsedData.categories.length > 0) {
        if (importOptions.replaceExisting) {
          setCategories(parsedData.categories);
        } else {
          setCategories((current) => {
            const existingIds = new Set(current.map(c => c.id));
            const newCategories = parsedData.categories.filter(c => !existingIds.has(c.id));
            return [...current, ...newCategories];
          });
        }
      }
      setImportProgress(75);

      if (importOptions.includeGoals && parsedData.savingsGoals.length > 0) {
        if (importOptions.replaceExisting) {
          setSavingsGoals(parsedData.savingsGoals);
        } else {
          setSavingsGoals((current) => {
            const existingIds = new Set(current.map(g => g.id));
            const newGoals = parsedData.savingsGoals.filter(g => !existingIds.has(g.id));
            return [...current, ...newGoals];
          });
        }
      }

      if (importOptions.includeSettings && parsedData.monthlyBudget > 0) {
        setMonthlyBudget(parsedData.monthlyBudget);
      }
      setImportProgress(100);

      // Record import history
      addBackupRecord({
        date: new Date().toISOString(),
        type: 'import',
        format: 'json',
        recordCount: Object.values(parsedData).reduce((sum, arr) => 
          Array.isArray(arr) ? sum + arr.length : sum, 0
        )
      });

      toast.success('🎉 Data imported successfully!', {
        description: 'Your backup has been restored'
      });

      setShowPreviewDialog(false);
      setImportPreview(null);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCleanupData = async () => {
    try {
      setIsImporting(true);
      setImportProgress(10);

      const cutoffDate = new Date();
      if (cleanupOptions.olderThan === '6months') {
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      } else if (cleanupOptions.olderThan === '1year') {
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      } else if (cleanupOptions.olderThan === '2years') {
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
      }

      let removedCount = 0;

      if (cleanupOptions.includeExpenses) {
        setExpenses((current) => {
          const filtered = current.filter(expense => {
            const expenseDate = new Date(expense.date);
            const shouldRemove = expenseDate < cutoffDate;
            if (shouldRemove && cleanupOptions.categories.length > 0) {
              return !cleanupOptions.categories.includes(expense.category);
            }
            if (shouldRemove) removedCount++;
            return !shouldRemove;
          });
          return filtered;
        });
        setImportProgress(40);
      }

      if (cleanupOptions.includeBudgets) {
        setBudgets((current) => {
          const filtered = current.filter(budget => {
            if (cleanupOptions.categories.length > 0) {
              return !cleanupOptions.categories.includes(budget.category);
            }
            return false; // Remove all if no specific categories
          });
          removedCount += current.length - filtered.length;
          return filtered;
        });
        setImportProgress(70);
      }

      if (cleanupOptions.includeGoals) {
        setSavingsGoals((current) => {
          // Only remove completed goals older than cutoff
          const filtered = current.filter(goal => {
            if (goal.current >= goal.target) {
              const goalDate = new Date(goal.deadline);
              return goalDate >= cutoffDate;
            }
            return true;
          });
          removedCount += current.length - filtered.length;
          return filtered;
        });
      }

      setImportProgress(100);
      
      toast.success(`🧹 Cleanup completed!`, {
        description: `Removed ${removedCount} old records`
      });

      setShowCleanupDialog(false);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup data', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = async () => {
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Data Backup & Restore 💾
        </h2>
        <p className="text-muted-foreground">
          Export your financial data for backup or import existing data
        </p>
      </motion.div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download size={16} />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload size={16} />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="flex items-center gap-2">
            <Archive size={16} />
            Data Cleanup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  Export Your Financial Data
                </CardTitle>
                <CardDescription>
                  Create a backup of your expenses, budgets, categories, and savings goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{expenses.length}</div>
                    <div className="text-sm text-blue-600">Expenses</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{budgets.length}</div>
                    <div className="text-sm text-green-600">Budgets</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                    <div className="text-sm text-purple-600">Categories</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{savingsGoals.length}</div>
                    <div className="text-sm text-orange-600">Goals</div>
                  </div>
                </div>

                <Separator />

                {/* Export Options */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Complete Backup (JSON)</h3>
                        <p className="text-sm text-muted-foreground">
                          Full backup with all data and metadata
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleExportJSON}
                      disabled={isExporting || totalRecords === 0}
                      className="w-full"
                      size="sm"
                    >
                      {isExporting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Database size={16} />
                        </motion.div>
                      ) : (
                        <Download size={16} />
                      )}
                      Export JSON
                    </Button>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={20} className="text-green-600" />
                      <div>
                        <h3 className="font-semibold">Expenses Only (CSV)</h3>
                        <p className="text-sm text-muted-foreground">
                          Spreadsheet-compatible format
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleExportCSV}
                      disabled={isExporting || expenses.length === 0}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      {isExporting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <FileSpreadsheet size={16} />
                        </motion.div>
                      ) : (
                        <Download size={16} />
                      )}
                      Export CSV
                    </Button>
                  </Card>
                </div>

                <Separator />

                {/* Data Insights */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Backup Insights</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                        <span className="font-medium">
                          {dataInsights.lastBackupDate 
                            ? new Date(dataInsights.lastBackupDate).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Backups:</span>
                        <span className="font-medium">{dataInsights.totalBackups}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                        <span className="font-medium">{dataInsights.storageUsed}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Backup Frequency:</span>
                        <Badge variant={
                          dataInsights.backupFrequency === 'frequent' ? 'default' :
                          dataInsights.backupFrequency === 'regular' ? 'secondary' :
                          dataInsights.backupFrequency === 'infrequent' ? 'outline' : 'destructive'
                        }>
                          {dataInsights.backupFrequency}
                        </Badge>
                      </div>
                      {dataInsights.oldestExpense && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Data Range:</span>
                          <span className="font-medium text-xs">
                            {new Date(dataInsights.oldestExpense).getFullYear()} - {new Date(dataInsights.newestExpense!).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {dataInsights.recommendations.length > 0 && (
                    <Alert>
                      <Info size={16} />
                      <AlertDescription>
                        <strong>Recommendations:</strong><br />
                        {dataInsights.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm mt-1">• {rec}</div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {totalRecords === 0 && (
                  <Alert>
                    <Info size={16} />
                    <AlertDescription>
                      No data available to export. Add some expenses, budgets, or goals first.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Import Financial Data
                </CardTitle>
                <CardDescription>
                  Restore from a backup or import data from spreadsheets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Import Progress */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                )}

                {/* Import Options */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Restore from Backup</h3>
                        <p className="text-sm text-muted-foreground">
                          Import complete JSON backup file
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="json-import">Select JSON backup file</Label>
                      <Input
                        id="json-import"
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        disabled={isImporting}
                        ref={fileInputRef}
                      />
                    </div>
                  </Card>

                  <Card className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={20} className="text-green-600" />
                      <div>
                        <h3 className="font-semibold">Import from CSV</h3>
                        <p className="text-sm text-muted-foreground">
                          Import expenses from spreadsheet
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="csv-import">Select CSV file</Label>
                      <Input
                        id="csv-import"
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        disabled={isImporting}
                        ref={csvInputRef}
                      />
                    </div>
                  </Card>
                </div>

                {/* CSV Format Info */}
                <Alert>
                  <Info size={16} />
                  <AlertDescription>
                    <strong>CSV Format:</strong> Date, Amount, Category, Description<br />
                    Example: 2024-01-15, 500, Food & Dining, "Lunch at restaurant"
                  </AlertDescription>
                </Alert>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle size={16} />
                    <AlertDescription>
                      <strong>Validation Errors:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="cleanup" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive size={20} />
                  Data Cleanup & Management
                </CardTitle>
                <CardDescription>
                  Remove old data to optimize performance and storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cleanup Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                    <div className="text-sm text-blue-600">Total Records</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{oldExpenses}</div>
                    <div className="text-sm text-orange-600">Old Expenses</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((totalRecords * 0.1))}MB
                    </div>
                    <div className="text-sm text-green-600">Est. Storage</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {categories.length}
                    </div>
                    <div className="text-sm text-purple-600">Categories</div>
                  </div>
                </div>

                <Separator />

                {/* Cleanup Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Automated Cleanup Options</h3>
                  
                  <Alert>
                    <Info size={16} />
                    <AlertDescription>
                      <strong>Recommended:</strong> Clean up expenses older than 1 year to maintain performance while keeping recent financial history.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={() => setShowCleanupDialog(true)}
                    variant="outline"
                    className="w-full"
                    disabled={totalRecords === 0}
                  >
                    <Archive size={16} className="mr-2" />
                    Configure Data Cleanup
                  </Button>

                  {oldExpenses > 0 && (
                    <Button 
                      onClick={() => {
                        setCleanupOptions({
                          ...cleanupOptions,
                          olderThan: '6months',
                          includeExpenses: true
                        });
                        handleCleanupData();
                      }}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash size={16} className="mr-2" />
                      Quick Clean: Remove Old Expenses (6+ months)
                    </Button>
                  )}
                </div>

                {totalRecords === 0 && (
                  <Alert>
                    <Info size={16} />
                    <AlertDescription>
                      No data available for cleanup. Start using the app to accumulate financial data.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Data Cleanup Configuration Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive size={20} className="text-orange-600" />
              Configure Data Cleanup
            </DialogTitle>
            <DialogDescription>
              Choose what data to remove. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Time Range */}
            <div className="space-y-2">
              <Label>Remove data older than:</Label>
              <Select 
                value={cleanupOptions.olderThan} 
                onValueChange={(value) => setCleanupOptions({...cleanupOptions, olderThan: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="2years">2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Types */}
            <div className="space-y-3">
              <Label>Data types to clean:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expenses"
                  checked={cleanupOptions.includeExpenses}
                  onCheckedChange={(checked) => setCleanupOptions({
                    ...cleanupOptions, 
                    includeExpenses: checked as boolean
                  })}
                />
                <Label htmlFor="expenses">Old Expenses</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgets"
                  checked={cleanupOptions.includeBudgets}
                  onCheckedChange={(checked) => setCleanupOptions({
                    ...cleanupOptions, 
                    includeBudgets: checked as boolean
                  })}
                />
                <Label htmlFor="budgets">Unused Budgets</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goals"
                  checked={cleanupOptions.includeGoals}
                  onCheckedChange={(checked) => setCleanupOptions({
                    ...cleanupOptions, 
                    includeGoals: checked as boolean
                  })}
                />
                <Label htmlFor="goals">Completed Goals</Label>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle size={16} />
              <AlertDescription>
                This action is permanent. Consider creating a backup before proceeding.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCleanupDialog(false)}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCleanupData}
                disabled={isImporting || (!cleanupOptions.includeExpenses && !cleanupOptions.includeBudgets && !cleanupOptions.includeGoals)}
                variant="destructive"
              >
                {isImporting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Archive size={16} />
                  </motion.div>
                ) : (
                  <Trash size={16} />
                )}
                Cleanup Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Import Preview & Options
            </DialogTitle>
            <DialogDescription>
              Review and configure what data to import. Existing data will be preserved unless you choose to replace it.
            </DialogDescription>
          </DialogHeader>

          {importPreview && (
            <div className="space-y-4">
              {/* Import Options */}
              <div className="space-y-3">
                <h4 className="font-semibold">Import Options</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="replace-existing"
                    checked={importOptions.replaceExisting}
                    onCheckedChange={(checked) => setImportOptions({
                      ...importOptions, 
                      replaceExisting: checked as boolean
                    })}
                  />
                  <Label htmlFor="replace-existing" className="text-sm">
                    Replace existing data (instead of merging)
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-expenses"
                      checked={importOptions.includeExpenses}
                      onCheckedChange={(checked) => setImportOptions({
                        ...importOptions, 
                        includeExpenses: checked as boolean
                      })}
                    />
                    <Label htmlFor="import-expenses" className="text-sm">Expenses</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-budgets"
                      checked={importOptions.includeBudgets}
                      onCheckedChange={(checked) => setImportOptions({
                        ...importOptions, 
                        includeBudgets: checked as boolean
                      })}
                    />
                    <Label htmlFor="import-budgets" className="text-sm">Budgets</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-categories"
                      checked={importOptions.includeCategories}
                      onCheckedChange={(checked) => setImportOptions({
                        ...importOptions, 
                        includeCategories: checked as boolean
                      })}
                    />
                    <Label htmlFor="import-categories" className="text-sm">Categories</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-goals"
                      checked={importOptions.includeGoals}
                      onCheckedChange={(checked) => setImportOptions({
                        ...importOptions, 
                        includeGoals: checked as boolean
                      })}
                    />
                    <Label htmlFor="import-goals" className="text-sm">Goals</Label>
                  </div>
                </div>
              </div>

              <Separator />
              {/* Import Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {importPreview.data.expenses?.length || 0}
                  </div>
                  <div className="text-xs text-blue-600">Expenses</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {importPreview.data.budgets?.length || 0}
                  </div>
                  <div className="text-xs text-green-600">Budgets</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {importPreview.data.categories?.length || 0}
                  </div>
                  <div className="text-xs text-purple-600">Categories</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {importPreview.data.savingsGoals?.length || 0}
                  </div>
                  <div className="text-xs text-orange-600">Goals</div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <h4 className="font-semibold">Backup Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Export Date:</span>
                    <Badge variant="outline">
                      {new Date(importPreview.exportDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <Badge variant="outline">{importPreview.version}</Badge>
                  </div>
                  {importPreview.metadata.dateRange.earliest && (
                    <div className="flex justify-between">
                      <span>Date Range:</span>
                      <Badge variant="outline">
                        {new Date(importPreview.metadata.dateRange.earliest).toLocaleDateString()} - {new Date(importPreview.metadata.dateRange.latest).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewDialog(false)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Upload size={16} />
                    </motion.div>
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Import Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}