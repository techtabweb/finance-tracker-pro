import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency } from '@/lib/format';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from '@phosphor-icons/react';

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
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: total,
    });
  }

  // Top spending categories
  const topCategories = categoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={24} />
        <h2 className="text-2xl font-bold">Analytics</h2>
      </div>

      {currentMonthExpenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <PieChartIcon size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No data to analyze</h3>
            <p className="text-muted-foreground">
              Add some expenses to see your spending analytics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average per Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSpent / new Date().getDate())}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {topCategories[0]?.name || 'None'}
                </div>
                {topCategories[0] && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(topCategories[0].value)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories List */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => {
                    const percentage = totalSpent > 0 ? (category.value / totalSpent) * 100 : 0;
                    return (
                      <div key={category.name} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm font-medium text-muted-foreground w-4">
                            #{index + 1}
                          </span>
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(category.value)}</div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="oklch(0.45 0.15 200)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}