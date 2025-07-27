import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { useFinanceData } from '@/hooks/use-finance-data';
import { Overview } from '@/components/Overview';
import { ExpensesList } from '@/components/ExpensesList';
import { BudgetsList } from '@/components/BudgetsList';
import { Analytics } from '@/components/Analytics';
import { SavingsGoals } from '@/components/SavingsGoals';
import { Reports } from '@/components/Reports';
import { Wellness } from '@/components/Wellness';
import { Learning } from '@/components/Learning';
import { UserProfile } from '@/components/UserProfile';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeTab, setActiveTab } = useFinanceData();
  const isMobile = useIsMobile();

  const tabs = [
    { value: 'overview', label: 'Overview', icon: '📊', emoji: '💰', shortLabel: 'Home' },
    { value: 'expenses', label: 'Expenses', icon: '🧾', emoji: '💸', shortLabel: 'Expenses' },
    { value: 'budgets', label: 'Budgets', icon: '💰', emoji: '🎯', shortLabel: 'Budget' },
    { value: 'goals', label: 'Goals', icon: '🎯', emoji: '💎', shortLabel: 'Goals' },
    { value: 'wellness', label: 'Wellness', icon: '❤️', emoji: '💯', shortLabel: 'Health' },
    { value: 'learning', label: 'Learning', icon: '🧠', emoji: '✨', shortLabel: 'Learn' },
    { value: 'analytics', label: 'Analytics', icon: '📈', emoji: '🔍', shortLabel: 'Charts' },
    { value: 'reports', label: 'Reports', icon: '📄', emoji: '📋', shortLabel: 'Reports' },
    { value: 'profile', label: 'Profile', icon: '👤', emoji: '⚙️', shortLabel: 'Profile' }
  ];

  const currentTab = tabs.find(tab => tab.value === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Header */}
      <motion.div 
        className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl sm:text-4xl">💳</div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Finance Tracker
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Smart money management for India 🇮🇳
                </p>
              </div>
            </motion.div>
            
            {/* Mobile current tab indicator */}
            {isMobile && (
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xl">{currentTab?.icon}</span>
                <span className="font-medium text-gray-700 text-sm">{currentTab?.shortLabel}</span>
              </motion.div>
            )}

            {/* Desktop quick stats */}
            {!isMobile && (
              <motion.div 
                className="flex items-center gap-4 text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500">Welcome to</div>
                  <div className="font-medium text-gray-700">Finance Tracker</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            {/* Desktop Navigation */}
            {!isMobile && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-3 bg-white/70 backdrop-blur-sm border-white/30 shadow-lg">
                  <TabsList className="grid w-full grid-cols-9 bg-transparent gap-2 h-auto">
                    {tabs.map((tab, index) => (
                      <motion.div
                        key={tab.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="h-full"
                      >
                        <TabsTrigger 
                          value={tab.value} 
                          className="flex flex-col items-center gap-2 p-4 h-full data-[state=active]:bg-white/90 data-[state=active]:shadow-md data-[state=active]:scale-105 rounded-xl transition-all duration-300 hover:bg-white/50 hover:scale-102 group"
                        >
                          <span className="text-2xl group-data-[state=active]:scale-110 transition-transform">{tab.icon}</span>
                          <span className="text-xs font-medium group-data-[state=active]:text-gray-900 text-gray-700">{tab.label}</span>
                        </TabsTrigger>
                      </motion.div>
                    ))}
                  </TabsList>
                </Card>
              </motion.div>
            )}

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200/50">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TabsList className="grid w-full grid-cols-9 bg-transparent p-3 gap-1 h-auto">
                  {tabs.map((tab, index) => (
                    <motion.div
                      key={tab.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <TabsTrigger 
                        value={tab.value} 
                        className="flex flex-col items-center gap-1 p-2 h-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-xl transition-all duration-200 hover:bg-gray-100"
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="text-[9px] font-medium leading-tight">{tab.shortLabel}</span>
                      </TabsTrigger>
                    </motion.div>
                  ))}
                </TabsList>
              </motion.div>
            </div>
          )}

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`${isMobile ? 'pb-24 mobile-content' : 'pb-6'}`}
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
              
              <TabsContent value="wellness" className="mt-0">
                <Wellness />
              </TabsContent>
              
              <TabsContent value="learning" className="mt-0">
                <Learning />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <Analytics />
              </TabsContent>
              
              <TabsContent value="reports" className="mt-0">
                <Reports />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <UserProfile />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
      
      <Toaster 
        position={isMobile ? "top-center" : "bottom-right"}
        richColors 
        closeButton
      />
    </div>
  );
}

export default App;