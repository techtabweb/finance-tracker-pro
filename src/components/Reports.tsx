import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, getMonthNameByNumber } from '@/lib/format';
import { Download, Calendar, ChartLineDown, ChartLineUp, FileText, PiggyBank, Wallet, CreditCard } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#f97316', '#84cc16'];

// PDF-safe color conversion helper
const convertColorForPDF = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return { r, g, b };
};

interface ReportData {
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
  monthlyTrend: Array<{ month: string; amount: number; budget: number }>;
  dailySpending: Array<{ day: string; amount: number }>;
  totalExpenses: number;
  totalBudget: number;
  budgetUtilization: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
}

export function Reports() {
  const { expenses, budgets, monthlyBudget } = useFinanceData();
  const [selectedPeriod, setSelectedPeriod] = useState<'1' | '3' | '6' | '12'>('3');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Generate report data based on selected period
  const generateReportData = (): ReportData => {
    const months = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const filteredExpenses = expenses?.filter(expense => 
      new Date(expense.date) >= cutoffDate
    ) || [];

    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value: typeof value === 'number' ? value : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    // Monthly trend
    const monthlyData = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const month = date.toISOString().slice(0, 7);
      
      const monthExpenses = filteredExpenses.filter(expense => 
        expense.date.startsWith(month)
      );
      
      const amount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: getMonthNameByNumber(date.getMonth() + 1),
        amount,
        budget: monthlyBudget || 0
      };
    });

    // Daily spending for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses?.filter(expense => 
      expense.date.startsWith(currentMonth)
    ) || [];

    const dailyData = currentMonthExpenses.reduce((acc, expense) => {
      const day = expense.date.split('-')[2];
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const dailySpending = Object.entries(dailyData)
      .map(([day, amount]) => ({ day: `${day}`, amount: typeof amount === 'number' ? amount : 0 }))
      .sort((a, b) => parseInt(a.day) - parseInt(b.day));

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = (budgets?.reduce((sum, budget) => sum + budget.limit, 0) || 0) * months;
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    // Top categories
    const topCategories = categoryBreakdown.slice(0, 5).map(cat => ({
      category: cat.name,
      amount: typeof cat.value === 'number' ? cat.value : 0,
      percentage: totalExpenses > 0 ? ((typeof cat.value === 'number' ? cat.value : 0) / totalExpenses) * 100 : 0
    }));

    return {
      categoryBreakdown,
      monthlyTrend: monthlyData,
      dailySpending,
      totalExpenses,
      totalBudget,
      budgetUtilization,
      topCategories
    };
  };

  const reportData = generateReportData();

  const exportToPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with wrapping
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const { fontSize = 10, fontStyle = 'normal', maxWidth = contentWidth, align = 'left' } = options;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        return y + (lines.length * fontSize * 0.4);
      };

      // Header
      pdf.setFillColor(139, 92, 246); // Purple background
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      yPosition = addText('💳 FINANCE TRACKER', pageWidth / 2, 20, { 
        fontSize: 24, 
        fontStyle: 'bold', 
        align: 'center' 
      });
      
      yPosition = addText('Detailed Expense Report', pageWidth / 2, yPosition + 5, { 
        fontSize: 14, 
        align: 'center' 
      });

      // Reset text color
      pdf.setTextColor(0, 0, 0);
      yPosition = 60;

      // Report period and date
      yPosition = addText(`Report Period: Last ${selectedPeriod} Month${selectedPeriod === '1' ? '' : 's'}`, margin, yPosition, { 
        fontSize: 12, 
        fontStyle: 'bold' 
      });
      yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, margin, yPosition + 5, { fontSize: 10 });

      yPosition += 15;

      // Summary Section
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, contentWidth, 50, 'F');
      
      yPosition += 10;
      yPosition = addText('📊 FINANCIAL SUMMARY', margin + 5, yPosition, { 
        fontSize: 16, 
        fontStyle: 'bold' 
      });

      yPosition += 5;
      const summaryData = [
        [`Total Expenses:`, `${formatCurrency(reportData.totalExpenses)}`],
        [`Total Budget:`, `${formatCurrency(reportData.totalBudget)}`],
        [`Budget Utilization:`, `${reportData.budgetUtilization.toFixed(1)}%`],
        [`Average per Month:`, `${formatCurrency(reportData.totalExpenses / parseInt(selectedPeriod))}`]
      ];

      summaryData.forEach(([label, value]) => {
        yPosition = addText(label, margin + 10, yPosition + 8, { fontSize: 11, fontStyle: 'bold' });
        addText(value, margin + 80, yPosition - 8, { fontSize: 11 });
      });

      yPosition += 20;

      // Top Categories Section
      if (reportData.topCategories.length > 0) {
        yPosition = addText('🏆 TOP SPENDING CATEGORIES', margin, yPosition, { 
          fontSize: 14, 
          fontStyle: 'bold' 
        });
        yPosition += 10;

        reportData.topCategories.forEach((category, index) => {
          const percentage = category.percentage.toFixed(1);
          yPosition = addText(`${index + 1}. ${category.category}`, margin + 5, yPosition, { 
            fontSize: 11, 
            fontStyle: 'bold' 
          });
          yPosition = addText(`   Amount: ${formatCurrency(category.amount)} (${percentage}%)`, margin + 5, yPosition + 2, { 
            fontSize: 10 
          });
          yPosition += 8;
        });

        yPosition += 10;
      }

      // Monthly Breakdown
      if (reportData.monthlyTrend.length > 0) {
        yPosition = addText('📅 MONTHLY BREAKDOWN', margin, yPosition, { 
          fontSize: 14, 
          fontStyle: 'bold' 
        });
        yPosition += 10;

        reportData.monthlyTrend.forEach(month => {
          const overBudget = month.amount > month.budget;
          yPosition = addText(`${month.month}:`, margin + 5, yPosition, { 
            fontSize: 11, 
            fontStyle: 'bold' 
          });
          yPosition = addText(`   Spent: ${formatCurrency(month.amount)}`, margin + 5, yPosition + 2, { 
            fontSize: 10 
          });
          yPosition = addText(`   Budget: ${formatCurrency(month.budget)}`, margin + 5, yPosition + 2, { 
            fontSize: 10 
          });
          if (overBudget) {
            yPosition = addText(`   ⚠️ Over budget by ${formatCurrency(month.amount - month.budget)}`, margin + 5, yPosition + 2, { 
              fontSize: 9 
            });
          }
          yPosition += 8;
        });
      }

      // Add new page if needed
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Financial Health Analysis
      yPosition += 10;
      yPosition = addText('💡 FINANCIAL INSIGHTS', margin, yPosition, { 
        fontSize: 14, 
        fontStyle: 'bold' 
      });
      yPosition += 10;

      const insights: string[] = [];
      
      if (reportData.budgetUtilization > 90) {
        insights.push('⚠️ High budget utilization - Consider reviewing spending patterns');
      } else if (reportData.budgetUtilization < 50) {
        insights.push('✅ Good budget control - Consider increasing savings');
      }

      if (reportData.topCategories.length > 0) {
        const topCategory = reportData.topCategories[0];
        if (topCategory.percentage > 40) {
          insights.push(`💰 ${topCategory.category} dominates spending (${topCategory.percentage.toFixed(1)}%)`);
        }
      }

      const avgDaily = reportData.totalExpenses / (parseInt(selectedPeriod) * 30);
      insights.push(`📊 Average daily spending: ${formatCurrency(avgDaily)}`);

      if (insights.length === 0) {
        insights.push('📈 Keep tracking your expenses for better insights');
      }

      insights.forEach(insight => {
        yPosition = addText(insight, margin + 5, yPosition, { fontSize: 10 });
        yPosition += 8;
      });

      // Footer - using RGB colors instead of oklch for PDF compatibility
      pdf.setFillColor(99, 102, 241); // Convert from oklch to RGB equivalent
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      addText('Generated by Finance Tracker 🇮🇳', pageWidth / 2, pageHeight - 10, { 
        fontSize: 10, 
        align: 'center' 
      });

      const filename = `expense-report-${selectedPeriod}months-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      
      toast.success('📄 Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Expense Reports
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <span>📊 Detailed analysis of your spending patterns</span>
              <Badge variant="secondary" className="ml-2">🇮🇳 India</Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: '1' | '3' | '6' | '12') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-44 bg-white/70 backdrop-blur-sm">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">📅 Last 1 Month</SelectItem>
              <SelectItem value="3">📅 Last 3 Months</SelectItem>
              <SelectItem value="6">📅 Last 6 Months</SelectItem>
              <SelectItem value="12">📅 Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={exportToPDF} 
            disabled={isGeneratingPDF} 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            {isGeneratingPDF ? (
              <>
                <FileText className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6 bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                    <ChartLineDown className="h-4 w-4" />
                    Total Expenses
                  </p>
                  <p className="text-3xl font-bold text-red-700 mt-1">
                    {formatCurrency(reportData.totalExpenses)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Last {selectedPeriod} month{selectedPeriod !== '1' ? 's' : ''}
                  </p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <Wallet className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                    <ChartLineUp className="h-4 w-4" />
                    Total Budget
                  </p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {formatCurrency(reportData.totalBudget)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Allocated budget
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <PiggyBank className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Budget Usage</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">
                    {reportData.budgetUtilization.toFixed(1)}%
                  </p>
                  <Badge 
                    variant={reportData.budgetUtilization > 90 ? "destructive" : reportData.budgetUtilization > 70 ? "secondary" : "default"}
                    className="mt-1"
                  >
                    {reportData.budgetUtilization > 90 ? "🚨 High" : reportData.budgetUtilization > 70 ? "⚠️ Medium" : "✅ Good"}
                  </Badge>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Avg/Month
                  </p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {formatCurrency(reportData.totalExpenses / parseInt(selectedPeriod))}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Monthly average
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Health Indicator */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              💡 Financial Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl mb-2">
                  {reportData.budgetUtilization <= 50 ? '🎉' : reportData.budgetUtilization <= 80 ? '😊' : '😰'}
                </div>
                <p className="font-semibold text-indigo-700">Spending Control</p>
                <p className="text-sm text-muted-foreground">
                  {reportData.budgetUtilization <= 50 ? 'Excellent control' : 
                   reportData.budgetUtilization <= 80 ? 'Good management' : 'Needs attention'}
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="font-semibold text-indigo-700">Daily Average</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(reportData.totalExpenses / (parseInt(selectedPeriod) * 30))} per day
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-semibold text-indigo-700">Top Category</p>
                <p className="text-sm text-muted-foreground">
                  {reportData.topCategories[0]?.category || 'None'} 
                  {reportData.topCategories[0] && ` (${reportData.topCategories[0].percentage.toFixed(1)}%)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                🍰 Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg font-medium">No expense data available</p>
                  <p className="text-sm">Start adding expenses to see the breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                📈 Monthly Spending Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)} 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Bar dataKey="amount" fill="#8b5cf6" name="💸 Expenses" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budget" fill="#06b6d4" name="🎯 Budget" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-lg font-medium">No trend data available</p>
                  <p className="text-sm">Add expenses across multiple months to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Spending and Top Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Spending */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                📅 Daily Spending (Current Month)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.dailySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData.dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)} 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg font-medium">No daily data available</p>
                  <p className="text-sm">Add expenses this month to see daily patterns</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                🏆 Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reportData.topCategories.length > 0 ? (
                  reportData.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-150 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                          <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-semibold text-gray-700">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span>{category.percentage.toFixed(1)}%</span>
                          <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${category.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-lg font-medium">No category data available</p>
                    <p className="text-sm">Start categorizing your expenses to see top spenders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}