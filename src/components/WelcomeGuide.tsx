import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Receipt, BarChart3 } from 'lucide-react';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useAuth } from '@/hooks/use-auth';

interface WelcomeGuideProps {
  onGetStarted: () => void;
}

export const WelcomeGuide = ({ onGetStarted }: WelcomeGuideProps) => {
  const { user } = useAuth();
  const { setActiveTab } = useFinanceData();

  const features = [
    {
      icon: <Receipt className="w-8 h-8 text-blue-500" />,
      title: "Track Expenses",
      description: "Log your daily expenses with smart AI-powered receipt scanning",
      action: () => setActiveTab('expenses')
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Set Budgets",
      description: "Create monthly budgets and track your spending goals",
      action: () => setActiveTab('budgets')
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      title: "View Analytics",
      description: "Get insights into your spending patterns with beautiful charts",
      action: () => setActiveTab('analytics')
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      title: "Savings Goals",
      description: "Set and track your financial goals to build wealth",
      action: () => setActiveTab('goals')
    }
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Finance Tracker, {firstName}!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You're all set to take control of your finances. Let's start by exploring what you can do with your new financial dashboard.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <Card 
              className="h-full bg-white/70 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={feature.action}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <Sparkles className="w-5 h-5" />
                  Ready to Get Started?
                </h3>
                <p className="text-white/90">
                  Add your first expense or set up a budget to begin your financial journey.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary"
                  onClick={() => setActiveTab('expenses')}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  Add Expense
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('budgets')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Set Budget
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              💡 Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• Start by setting a monthly budget to track your overall spending</p>
              <p>• Use the receipt scanner 📱 to quickly add expenses on the go</p>
              <p>• Check your financial wellness score to monitor your progress</p>
              <p>• Set savings goals to stay motivated and build wealth</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};