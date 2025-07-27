import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useTheme } from '@/hooks/use-theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Overview } from '@/components/Overview';
import { ExpensesList } from '@/components/ExpensesList';
import { BudgetsList } from '@/components/BudgetsList';
import { Analytics } from '@/components/Analytics';
import { SavingsGoals } from '@/components/SavingsGoals';
import { Reports } from '@/components/Reports';
import { Wellness } from '@/components/Wellness';
import { Learning } from '@/components/Learning';
import { UserProfile } from '@/components/UserProfile';
import { ExpensePredictions } from '@/components/ExpensePredictions';
import { BudgetInsights } from '@/components/BudgetInsights';
import { FinanceChat } from '@/components/FinanceChat';
import { SystemValidator } from '@/components/SystemValidator';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeTab, setActiveTab } = useFinanceData();
  const { applyTheme, settings } = useTheme();
  const isMobile = useIsMobile();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement>>({});

  // Apply theme on mount and when settings change
  useEffect(() => {
    applyTheme();
  }, [settings, applyTheme]);

  // Auto-scroll to center active tab on desktop
  useEffect(() => {
    if (!isMobile && scrollContainerRef.current && tabRefs.current[activeTab]) {
      const container = scrollContainerRef.current;
      const activeTabElement = tabRefs.current[activeTab];
      
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      // Calculate the position to center the tab
      const containerCenter = containerRect.width / 2;
      const tabCenter = tabRect.left - containerRect.left + tabRect.width / 2;
      const scrollOffset = tabCenter - containerCenter;
      
      // Smooth scroll to center the active tab
      container.scrollTo({
        left: container.scrollLeft + scrollOffset,
        behavior: 'smooth'
      });
    }
  }, [activeTab, isMobile]);

  // Function to store tab refs
  const setTabRef = (value: string) => (el: HTMLElement | null) => {
    if (el) {
      tabRefs.current[value] = el;
    }
  };

  const tabs = [
    // Core functionality
    { value: 'overview', label: 'Overview', icon: '📊', emoji: '💰', shortLabel: 'Home', category: 'core' },
    { value: 'expenses', label: 'Expenses', icon: '🧾', emoji: '💸', shortLabel: 'Expenses', category: 'core' },
    { value: 'budgets', label: 'Budgets', icon: '💰', emoji: '🎯', shortLabel: 'Budget', category: 'core' },
    { value: 'analytics', label: 'Analytics', icon: '📈', emoji: '🔍', shortLabel: 'Charts', category: 'core' },
    
    // Goals & Planning
    { value: 'goals', label: 'Goals', icon: '🎯', emoji: '💎', shortLabel: 'Goals', category: 'planning' },
    { value: 'predictions', label: 'Predictions', icon: '🔮', emoji: '🚀', shortLabel: 'Predict', category: 'planning' },
    { value: 'reports', label: 'Reports', icon: '📄', emoji: '📋', shortLabel: 'Reports', category: 'planning' },
    
    // AI & Intelligence
    { value: 'chat', label: 'AI Chat', icon: '💬', emoji: '🤖', shortLabel: 'Chat', category: 'ai' },
    { value: 'insights', label: 'ML Insights', icon: '🤖', emoji: '🔮', shortLabel: 'AI', category: 'ai' },
    { value: 'learning', label: 'Learning', icon: '🧠', emoji: '✨', shortLabel: 'Learn', category: 'ai' },
    
    // Health & System
    { value: 'wellness', label: 'Wellness', icon: '❤️', emoji: '💯', shortLabel: 'Health', category: 'system' },
    { value: 'validator', label: 'System Check', icon: '🔧', emoji: '🛠️', shortLabel: 'Check', category: 'system' },
    { value: 'profile', label: 'Profile', icon: '👤', emoji: '⚙️', shortLabel: 'Profile', category: 'system' }
  ];

  const currentTab = tabs.find(tab => tab.value === activeTab);
  
  // Priority tabs for mobile (most important ones)
  const priorityTabs = [
    'overview', 'expenses', 'budgets', 'analytics', 'chat'
  ];
  
  const mobileMainTabs = tabs.filter(tab => priorityTabs.includes(tab.value));
  const mobileSecondaryTabs = tabs.filter(tab => !priorityTabs.includes(tab.value));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <motion.div 
        className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Finance Tracker
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Smart money management for India 🇮🇳
                </p>
              </div>
            </motion.div>
            
            {/* Mobile current tab indicator */}
            {isMobile && currentTab && (
              <motion.div 
                className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                <span className="text-lg">{currentTab.icon}</span>
                <span className="font-medium text-primary text-sm">{currentTab.shortLabel}</span>
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
                  <div className="text-xs text-muted-foreground">Welcome to</div>
                  <div className="font-medium text-foreground">Finance Tracker</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          {/* Desktop Navigation - Enhanced Horizontal Scrolling */}
          {!isMobile && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-2 bg-card/80 backdrop-blur-lg border-border shadow-xl relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
                
                <div className="relative">
                  {/* Enhanced gradient overlays for better scroll indication */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card/80 via-card/60 to-transparent z-20 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card/80 via-card/60 to-transparent z-20 pointer-events-none" />
                  
                  {/* Scroll indicators */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 text-muted-foreground/60">
                    <div className="w-1 h-8 bg-gradient-to-b from-transparent via-current to-transparent rounded-full" />
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 text-muted-foreground/60">
                    <div className="w-1 h-8 bg-gradient-to-b from-transparent via-current to-transparent rounded-full" />
                  </div>
                  
                  <div className=\"overflow-x-auto scrollbar-hide horizontal-scroll\" ref={scrollContainerRef}>
                    <TabsList className=\"flex w-max bg-transparent gap-2 h-auto min-w-full px-6 py-2\">
                      {tabs.map((tab, index) => (
                        <motion.div
                          key={tab.value}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.04,
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                          className="flex-shrink-0"
                        >
                          <TabsTrigger 
                            ref={setTabRef(tab.value)}
                            value={tab.value} 
                            className="group relative flex flex-col items-center gap-2 p-4 min-w-[110px] data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-2xl transition-all duration-300 hover:bg-muted/60 hover:scale-105 text-foreground border border-transparent hover:border-border/50 bg-background/40"
                          >
                            {/* Active state background glow */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                            
                            {/* Icon with enhanced animation */}
                            <span className="relative text-2xl group-data-[state=active]:scale-110 group-hover:scale-105 transition-all duration-300 group-data-[state=active]:drop-shadow-sm">
                              {tab.icon}
                            </span>
                            
                            {/* Label with better typography */}
                            <span className="relative text-[11px] font-semibold text-center leading-tight group-data-[state=active]:text-primary transition-colors duration-300">
                              {tab.label}
                            </span>
                            
                            {/* Category indicator dot */}
                            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 ${
                              tab.category === 'core' ? 'bg-primary/60' :
                              tab.category === 'ai' ? 'bg-accent/60' :
                              tab.category === 'planning' ? 'bg-blue-500/60' :
                              'bg-muted-foreground/40'
                            } group-data-[state=active]:scale-125 group-data-[state=active]:bg-primary`} />
                          </TabsTrigger>
                        </motion.div>
                      ))}
                    </TabsList>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Mobile Bottom Navigation - Enhanced with Improved More Menu */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb bg-card/95 backdrop-blur-xl shadow-2xl border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TabsList className="flex w-full bg-transparent p-2 gap-1 h-auto">
                  {/* Main tabs with enhanced styling */}
                  {mobileMainTabs.map((tab, index) => (
                    <motion.div
                      key={tab.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="flex-1"
                    >
                      <TabsTrigger 
                        value={tab.value} 
                        className="relative flex flex-col items-center gap-1 p-3 w-full data-[state=active]:bg-primary/15 data-[state=active]:text-primary rounded-xl transition-all duration-300 hover:bg-muted/50 text-muted-foreground group border border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
                      >
                        {/* Active indicator */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                        
                        <span className="text-lg group-data-[state=active]:scale-110 group-hover:scale-105 transition-transform duration-200">{tab.icon}</span>
                        <span className="text-[9px] font-semibold leading-tight text-center group-data-[state=active]:text-primary">{tab.shortLabel}</span>
                      </TabsTrigger>
                    </motion.div>
                  ))}
                  
                  {/* Enhanced More button */}
                  <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                    <SheetTrigger asChild>
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className="relative flex flex-col items-center gap-1 p-3 w-full rounded-xl hover:bg-muted/50 text-muted-foreground border border-transparent hover:border-border/50 transition-all duration-300"
                        >
                          {/* Notification dot for more menu */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                          
                          <span className="text-lg">⚡</span>
                          <span className="text-[9px] font-semibold leading-tight">More</span>
                        </Button>
                      </motion.div>
                    </SheetTrigger>
                    
                    <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl bg-card/95 backdrop-blur-xl border-t border-border">
                      <SheetHeader className="pb-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <SheetTitle className="text-left text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            More Options
                          </SheetTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Access additional features and tools
                          </p>
                        </motion.div>
                      </SheetHeader>
                      
                      {/* Organized categories */}
                      <div className="space-y-6">
                        {/* Group tabs by category */}
                        {Object.entries(
                          mobileSecondaryTabs.reduce((acc, tab) => {
                            const category = tab.category;
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(tab);
                            return acc;
                          }, {} as Record<string, typeof mobileSecondaryTabs>)
                        ).map(([category, categoryTabs], categoryIndex) => (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                category === 'planning' ? 'bg-blue-500' :
                                category === 'ai' ? 'bg-accent' :
                                'bg-muted-foreground'
                              }`} />
                              <h3 className="text-sm font-semibold text-foreground capitalize">
                                {category === 'ai' ? 'AI & Intelligence' : 
                                 category === 'planning' ? 'Goals & Planning' : 
                                 'Health & System'}
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3">
                              {categoryTabs.map((tab, tabIndex) => (
                                <motion.div
                                  key={tab.value}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: (categoryIndex * 0.1) + (tabIndex * 0.05) 
                                  }}
                                >
                                  <Button
                                    variant={activeTab === tab.value ? "default" : "ghost"}
                                    className="flex flex-col items-center gap-2 p-4 h-auto w-full rounded-xl hover:bg-muted/60 transition-all duration-200 hover:scale-105 border border-transparent hover:border-border/50"
                                    onClick={() => {
                                      setActiveTab(tab.value as any);
                                      setIsMoreOpen(false);
                                    }}
                                  >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span className="text-[10px] font-medium text-center leading-tight">
                                      {tab.shortLabel}
                                    </span>
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Quick stats in more menu */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">13</div>
                              <div className="text-xs text-muted-foreground">Features</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-accent">AI</div>
                              <div className="text-xs text-muted-foreground">Powered</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">🇮🇳</div>
                              <div className="text-xs text-muted-foreground">India</div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </SheetContent>
                  </Sheet>
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
              
              <TabsContent value="insights" className="mt-0">
                <BudgetInsights />
              </TabsContent>
              
              <TabsContent value="predictions" className="mt-0">
                <ExpensePredictions />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <Analytics />
              </TabsContent>
              
              <TabsContent value="reports" className="mt-0">
                <Reports />
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0">
                <FinanceChat />
              </TabsContent>
              
              <TabsContent value="validator" className="mt-0">
                <SystemValidator />
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
    </ErrorBoundary>
  );
}

export default App;