import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { useFinanceData } from '@/hooks/use-finance-data';
import { Overview } from '@/components/Overview';
import { ExpensesList } from '@/components/ExpensesList';
import { BudgetsList } from '@/components/BudgetsList';
import { Analytics } from '@/components/Analytics';
import { SavingsGoals } from '@/components/SavingsGoals';
import { Reports } from '@/components/Reports';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeTab, setActiveTab } = useFinanceData();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { value: 'overview', label: 'Overview', icon: '📊', emoji: '💰' },
    { value: 'expenses', label: 'Expenses', icon: '🧾', emoji: '💸' },
    { value: 'budgets', label: 'Budgets', icon: '💰', emoji: '🎯' },
    { value: 'goals', label: 'Goals', icon: '🎯', emoji: '💎' },
    { value: 'analytics', label: 'Analytics', icon: '📈', emoji: '🔍' },
    { value: 'reports', label: 'Reports', icon: '📄', emoji: '📋' }
  ];

  const currentTab = tabs.find(tab => tab.value === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-3xl">💳</div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Finance Tracker
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Smart money management for India 🇮🇳
                </p>
              </div>
            </motion.div>
            
            {/* Mobile current tab indicator */}
            <div className="sm:hidden flex items-center gap-2">
              <span className="text-2xl">{currentTab?.icon}</span>
              <span className="font-medium text-gray-700">{currentTab?.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          {/* Desktop Navigation */}
          <div className="hidden sm:block">
            <Card className="p-2 mb-6 bg-white/60 backdrop-blur-sm border-white/20">
              <TabsList className="grid w-full grid-cols-6 bg-transparent gap-1">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TabsTrigger 
                      value={tab.value} 
                      className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-white/40"
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="text-xs font-medium">{tab.label}</span>
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </Card>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
            <Card className="rounded-t-3xl rounded-b-none border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <TabsList className="grid w-full grid-cols-6 bg-transparent p-2 gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="flex flex-col items-center gap-1 p-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-xl transition-all duration-200"
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Card>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-24 sm:pb-6"
            >
              <TabsContent value="overview" className="mt-0">
                <Overview />
              </TabsContent>
              
              <TabsContent value="expenses" className="mt-0">
                <ExpensesList />
              </TabsContent>
              
              <TabsContent value="budgets" className="mt-0">
                <BudgetsList />
              </TabsContent>
              
              <TabsContent value="goals" className="mt-0">
                <SavingsGoals />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <Analytics />
              </TabsContent>
              
              <TabsContent value="reports" className="mt-0">
                <Reports />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;