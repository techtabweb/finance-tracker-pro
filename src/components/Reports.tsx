import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFinanceData } from '@/hooks/use-finance-data';
import { formatCurrency, getMonthNameByNumber } from '@/lib/format';
import { Download, Calendar, TrendingDown, TrendingUp, FileText } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#84cc16'];

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
    
    const filteredExpenses = expenses.filter(expense => 
      new Date(expense.date) >= cutoffDate
    );

    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
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
        budget: monthlyBudget
      };
    });

    // Daily spending for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    );

    const dailyData = currentMonthExpenses.reduce((acc, expense) => {
      const day = expense.date.split('-')[2];
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const dailySpending = Object.entries(dailyData)
      .map(([day, amount]) => ({ day: `${day}`, amount }))
      .sort((a, b) => parseInt(a.day) - parseInt(b.day));

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0) * months;
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    // Top categories
    const topCategories = categoryBreakdown.slice(0, 5).map(cat => ({
      category: cat.name,
      amount: cat.value,
      percentage: totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0
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
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create canvas from the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Add header
      pdf.setFontSize(20);
      pdf.text('Expense Report', pdfWidth / 2, 15, { align: 'center' });
      
      const filename = `expense-report-${selectedPeriod}-months-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      
      toast.success('Report exported successfully');
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
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Reports</h2>
          <p className="text-muted-foreground">Detailed analysis of your spending patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: '1' | '3' | '6' | '12') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} disabled={isGeneratingPDF} className="flex items-center gap-2">
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

      <div ref={reportRef} className="space-y-6 bg-background p-6 rounded-lg">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.totalBudget)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Usage</p>
                  <p className="text-2xl font-bold text-foreground">
                    {reportData.budgetUtilization.toFixed(1)}%
                  </p>
                </div>
                <Badge variant={reportData.budgetUtilization > 90 ? "destructive" : reportData.budgetUtilization > 70 ? "secondary" : "default"}>
                  {reportData.budgetUtilization > 90 ? "High" : reportData.budgetUtilization > 70 ? "Medium" : "Good"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg/Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.totalExpenses / parseInt(selectedPeriod))}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
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
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="#8b5cf6" name="Expenses" />
                    <Bar dataKey="budget" fill="#06b6d4" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Spending and Top Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending (Current Month)</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.dailySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData.dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-250 flex items-center justify-center text-muted-foreground">
                  No daily data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topCategories.length > 0 ? (
                  reportData.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No category data available
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