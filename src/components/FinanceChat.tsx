import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useIsMobile } from '@/hooks/use-mobile';
// Import removed - now using Spark LLM directly
import { formatAmount, getCurrentMonth } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatCircle, 
  PaperPlaneRight, 
  ChartLineUp, 
  ChartPie, 
  Calendar,
  CurrencyDollar,
  Target,
  Sparkle,
  ArrowClockwise,
  Lightbulb
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    analysisType?: string;
    dataPoints?: number;
    insights?: string[];
  };
}

const QUICK_QUESTIONS = [
  {
    icon: <ChartLineUp className="w-4 h-4" />,
    text: "How much did I spend this month?",
    category: "spending"
  },
  {
    icon: <ChartPie className="w-4 h-4" />,
    text: "What's my biggest expense category?",
    category: "analysis"
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    text: "Compare my spending with last month",
    category: "trends"
  },
  {
    icon: <CurrencyDollar className="w-4 h-4" />,
    text: "How am I doing with my budgets?",
    category: "budget"
  },
  {
    icon: <Target className="w-4 h-4" />,
    text: "Will I achieve my savings goals?",
    category: "goals"
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    text: "Give me money-saving tips based on my spending",
    category: "tips"
  }
];

export function FinanceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const {
    expenses,
    budgets,
    savingsGoals,
    monthlyBudget,
    categories,
    getCurrentMonthExpenses,
    getTotalSpent,
    getTotalBudget
  } = useFinanceData();

  // Initialize chat with welcome message
  useEffect(() => {
    if (!isInitialized) {
      try {
        const totalSpent = getTotalSpent();
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'assistant',
          content: `Hello! 👋 I'm your AI financial assistant powered by advanced AI. I can analyze your financial data and provide personalized insights about your spending patterns, budget performance, and financial health.

📊 **Your Current Data:**
• ${expenses?.length || 0} total expense${(expenses?.length || 0) !== 1 ? 's' : ''} tracked
• ${budgets?.length || 0} active budget${(budgets?.length || 0) !== 1 ? 's' : ''}
• ${savingsGoals?.length || 0} savings goal${(savingsGoals?.length || 0) !== 1 ? 's' : ''}
• ₹${formatAmount(totalSpent)} spent this month

I can help you with questions like:
• "How much did I spend on dining this month?"
• "Am I staying within my budgets?"
• "What are my spending trends?"
• "How can I improve my financial health?"

Ask me anything about your finances! 💰`,
          timestamp: new Date().toISOString(),
          metadata: {
            analysisType: 'welcome',
            dataPoints: (expenses?.length || 0) + (budgets?.length || 0) + (savingsGoals?.length || 0)
          }
        };
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized, expenses?.length, budgets?.length, savingsGoals?.length, getTotalSpent]);

  // Auto-scroll to bottom with better error handling
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      try {
        const scrollArea = scrollRef.current;
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        });
      } catch (error) {
        console.warn('Auto-scroll failed:', error);
      }
    }
  }, [messages]);

  // Prepare financial data context for AI
  const prepareFinancialContext = () => {
    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = getCurrentMonthExpenses();
    
    // Calculate spending by category
    const categorySpending = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate budget performance
    const budgetPerformance = budgets?.map(budget => ({
      category: budget.category,
      budgeted: budget.limit,
      spent: budget.spent,
      remaining: budget.limit - budget.spent,
      utilizationPercent: budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
    })) || [];

    // Calculate savings progress
    const savingsProgress = savingsGoals?.map(goal => ({
      name: goal.name,
      target: goal.target,
      current: goal.current,
      remaining: goal.target - goal.current,
      progressPercent: goal.target > 0 ? (goal.current / goal.target) * 100 : 0,
      deadline: goal.deadline
    })) || [];

    // Recent spending patterns (last 7 and 30 days)
    const now = new Date();
    const last7Days = expenses
      ?.filter(expense => {
        const expenseDate = new Date(expense.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return expenseDate >= weekAgo;
      })
      ?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    const last30Days = expenses
      ?.filter(expense => {
        const expenseDate = new Date(expense.date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return expenseDate >= monthAgo;
      })
      ?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    // Calculate monthly trends (last 3 months)
    const monthlyTrends: { month: string; total: number; expenseCount: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const monthStr = targetDate.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthExpenses = expenses?.filter(expense => expense.date.startsWith(monthStr)) || [];
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrends.push({
        month: monthStr,
        total: monthTotal,
        expenseCount: monthExpenses.length
      });
    }

    // Top spending categories (all time)
    const allTimeCategories = expenses?.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>) || {};

    const topCategories = Object.entries(allTimeCategories)
      .sort(([, a], [, b]: [string, number]) => Number(b) - Number(a))
      .slice(0, 5)
      .map(([category, amount]: [string, number]) => ({ category, amount: Number(amount) || 0 }));

    return {
      currentMonth,
      totalExpenses: expenses?.length || 0,
      currentMonthExpenses: currentMonthExpenses.length,
      totalSpentThisMonth: getTotalSpent(),
      totalBudgetAllocated: getTotalBudget(),
      monthlyBudgetLimit: monthlyBudget,
      categorySpending,
      budgetPerformance,
      savingsProgress,
      spendingTrends: {
        last7Days,
        last30Days,
        dailyAverage7Days: last7Days / 7,
        dailyAverage30Days: last30Days / 30,
        monthlyTrends
      },
      topCategories,
      availableCategories: categories?.map(cat => cat.name) || [],
      recentTransactions: currentMonthExpenses
        .slice(0, 10)
        .map(expense => ({
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date
        })),
      // Financial health indicators
      budgetUtilization: getTotalBudget() > 0 ? (getTotalSpent() / getTotalBudget()) * 100 : 0,
      savingsGoalProgress: (savingsGoals?.reduce((acc, goal) => acc + (goal.current / goal.target) * 100, 0) || 0) / Math.max(savingsGoals?.length || 1, 1),
      averageTransactionAmount: (expenses?.length || 0) > 0 ? (expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0) / (expenses?.length || 1) : 0
    };
  };

  const handleSendMessage = async (messageText: string = currentMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const financialContext = prepareFinancialContext();
      
      const promptText = `You are an AI financial advisor for Indian users. Analyze their financial data and answer their question: "${messageText}"

FINANCIAL DATA:
${JSON.stringify(financialContext, null, 2)}

Provide a helpful response with actual numbers from their data, using Indian Rupees (₹) format.`;

      const response = await spark.llm(promptText, 'gpt-4o');

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          analysisType: 'financial_analysis',
          dataPoints: financialContext.totalExpenses,
          insights: response.split('•').filter(point => point.trim().length > 10).slice(0, 3)
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessageContent = "I apologize, but I'm having trouble analyzing your financial data right now. ";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessageContent += "There seems to be an issue with the AI service. Please try again in a moment.";
        } else if (error.message.includes('rate limit')) {
          errorMessageContent += "I'm receiving too many requests right now. Please wait a moment and try again.";
        } else if (error.message.includes('network')) {
          errorMessageContent += "Please check your internet connection and try again.";
        } else {
          errorMessageContent += "Please try asking your question again, or try one of the quick questions below.";
        }
      } else {
        errorMessageContent += "Please try asking your question again, or try one of the quick questions below.";
      }
      
      toast.error('AI analysis temporarily unavailable');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorMessageContent + "\n\n🤖 **Tip**: Try asking simpler questions like:\n• \"How much did I spend this week?\"\n• \"Show my food expenses\"\n• \"Budget status\"",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([]);
    setIsInitialized(false);
    toast.success('Chat cleared');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-lg">
            <ChatCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Finance Assistant
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Powered by Gemini AI • Get personalized insights
            </p>
          </div>
        </div>

        {/* Data Summary - Mobile Optimized */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkle className="w-3 h-3" />
            {expenses?.length || 0} Expenses
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Target className="w-3 h-3" />
            {budgets?.length || 0} Budgets
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <ChartLineUp className="w-3 h-3" />
            ₹{formatAmount(getTotalSpent())}
          </Badge>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <Card className={`${
          isMobile 
            ? 'mobile-chat-container h-[calc(100vh-280px)] min-h-[350px] max-h-[calc(100vh-200px)]' 
            : 'h-[650px]'
        } flex flex-col w-full shadow-xl border border-border bg-card/90 backdrop-blur-md overflow-hidden`}>
          
          {/* Header */}
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2 text-foreground">
                <motion.span 
                  className="text-lg"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  💬
                </motion.span>
                Chat with AI
              </CardTitle>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-foreground h-8 px-2"
                >
                  <ArrowClockwise className="w-3 h-3 sm:w-4 sm:h-4" />
                  {!isMobile && <span className="ml-1">Clear</span>}
                </Button>
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
            {/* Messages Container */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              <ScrollArea ref={scrollRef} className="flex-1 px-3 sm:px-6 min-h-0">
                <div className="space-y-3 sm:space-y-4 py-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl shadow-lg ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground'
                              : 'bg-card/80 backdrop-blur-sm border border-border/50'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                            {message.content}
                          </div>
                          {message.metadata && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-2 text-[10px] sm:text-xs opacity-70 flex items-center gap-1"
                            >
                              {message.metadata.analysisType === 'financial_analysis' && (
                                <>
                                  <Sparkle className="w-3 h-3" />
                                  <span>Analyzed {message.metadata.dataPoints} data points</span>
                                </>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-3 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[80%] shadow-lg">
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex gap-1">
                            {[0, 0.2, 0.4].map((delay, i) => (
                              <motion.div 
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.4, 1, 0.4] 
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: Infinity, 
                                  delay 
                                }}
                              />
                            ))}
                          </div>
                          <span className="flex items-center gap-1">
                            <Sparkle className="w-3 h-3" />
                            Analyzing with AI...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Questions - Only show when chat is empty */}
              <AnimatePresence>
                {messages.length <= 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="px-3 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        Quick questions to get started:
                      </p>
                    </div>
                    <div className={`grid grid-cols-1 ${!isMobile ? 'sm:grid-cols-2' : ''} gap-2`}>
                      {QUICK_QUESTIONS.map((question, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickQuestion(question.text)}
                            className="justify-start gap-2 h-auto p-3 text-left hover:bg-primary/5 hover:border-primary/20 text-xs sm:text-sm w-full transition-all duration-200"
                          >
                            {question.icon}
                            <span className="truncate flex-1">{question.text}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="p-3 sm:p-6 pt-3 sm:pt-4 border-t bg-card/80 backdrop-blur-sm">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={isMobile ? "Ask about your finances..." : "Ask about your expenses, budgets, or financial goals..."}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className={`flex-1 text-xs sm:text-sm ${isMobile ? 'mobile-chat-input min-h-[44px]' : ''} transition-all duration-200 focus:scale-[1.02]`}
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isLoading}
                    size={isMobile ? "default" : "icon"}
                    className={`shrink-0 ${isMobile ? 'px-4 min-h-[44px]' : ''} bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200`}
                  >
                    <PaperPlaneRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    {isMobile && <span className="ml-2 text-xs">Send</span>}
                  </Button>
                </motion.div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkle className="w-3 h-3" />
                Try: "How much did I spend on food?" or "Budget analysis"
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}