import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { useFinanceData } from '@/hooks/use-finance-data';
import { Overview } from '@/components/Overview';
import { ExpensesList } from '@/components/ExpensesList';
import { BudgetsList } from '@/components/BudgetsList';
import { Analytics } from '@/components/Analytics';
import { SavingsGoals } from '@/components/SavingsGoals';
import { Wallet, Receipt, TrendingUp, LayoutDashboard, Target } from '@phosphor-icons/react';

function App() {
  const { activeTab, setActiveTab } = useFinanceData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Finance Tracker</h1>
          <p className="text-muted-foreground">Track expenses, manage budgets, and analyze your spending</p>
        </header>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard size={20} />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt size={20} />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Wallet size={20} />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target size={20} />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview />
          </TabsContent>
          
          <TabsContent value="expenses">
            <ExpensesList />
          </TabsContent>
          
          <TabsContent value="budgets">
            <BudgetsList />
          </TabsContent>
          
          <TabsContent value="goals">
            <SavingsGoals />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

export default App;