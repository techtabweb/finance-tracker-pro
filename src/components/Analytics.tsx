import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function Analytics() {
  const { expenses, categories, getCurrentMonthExpenses } = useFinanceData();

  const currentMonthExpenses = getCurrentMonthExpenses();

  // Category breakdown for pie chart
  const categoryData = categories.map(category => {
    const categoryExpenses = currentMonthExpenses.filter(expense => expense.category === category.name);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
    };
  }).filter(item => item.value > 0);

  // Monthly trend data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthKey));
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    monthlyData.push({
      month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      amount: total,
    });
  }

  // Top spending categories
  const topCategories = categoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryEmojis: { [key: string]: string } = {
    'Food': '🍽️',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Healthcare': '🏥',
    'Education': '📚',
    'Bills': '📄',
    'Other': '📦'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊</span>
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 text-sm mt-1">Insights into your spending patterns</p>
        </div>
      </motion.div>

      {currentMonthExpenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium mb-3">No data to analyze yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Add some expenses to unlock powerful insights about your spending patterns and financial habits
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total This Month",
                value: formatCurrency(totalSpent),
                icon: "💰",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Average per Day",
                value: formatCurrency(totalSpent / new Date().getDate()),
                icon: "📅",
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Top Category",
                value: topCategories[0]?.name || 'None',
                icon: categoryEmojis[topCategories[0]?.name] || "📦",
                color: "from-purple-500 to-violet-500"
              },
              {
                title: "Transactions",
                value: currentMonthExpenses.length.toString(),
                icon: "🧾",
                color: "from-orange-500 to-red-500"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-lg`}></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        {stat.title === "Top Category" && topCategories[0] && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(topCategories[0].value)}
                          </p>
                        )}
                      </div>
                      <span className="text-3xl">{stat.icon}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Category Breakdown Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🥧</span>
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          fontSize={12}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), 'Amount']} 
                          labelStyle={{ color: '#000' }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Categories List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Top Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCategories.map((category, index) => {
                      const percentage = totalSpent > 0 ? (category.value / totalSpent) * 100 : 0;
                      return (
                        <motion.div 
                          key={category.name} 
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-bold text-gray-700">
                              #{index + 1}
                            </div>
                            <span className="text-2xl">{categoryEmojis[category.name] || '📦'}</span>
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(category.value)}</div>
                            <div className="text-sm text-gray-600">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  6-Month Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value}`} 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Amount']}
                        labelStyle={{ color: '#000' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="url(#colorGradient)" 
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}