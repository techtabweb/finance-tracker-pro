export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async callGemini(prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Please add your API key in settings.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to call Gemini API');
    }
  }

  async analyzeExpense(description: string): Promise<{ category: string; confidence: number }> {
    if (!this.isConfigured()) {
      return { category: 'Other', confidence: 0 };
    }

    try {
      const prompt = `Analyze this expense description and categorize it. Return only a JSON response with category and confidence (0-1).

Description: "${description}"

Categories: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Education, Travel, Other

Example response: {"category": "Food", "confidence": 0.9}`;

      const response = await this.callGemini(prompt);
      const parsed = JSON.parse(response.trim());
      
      return {
        category: parsed.category || 'Other',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0))
      };
    } catch (error) {
      console.error('Error analyzing expense:', error);
      return { category: 'Other', confidence: 0 };
    }
  }

  async generateInsights(expenses: any[], budgets: any[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);

    const prompt = `Analyze these financial data and provide actionable insights in English:

Total Expenses: ₹${totalExpenses}
Total Budget: ₹${totalBudget}
Number of transactions: ${expenses.length}

Recent expenses: ${expenses.slice(0, 5).map(exp => `₹${exp.amount} - ${exp.category} - ${exp.description}`).join(', ')}

Budget categories: ${budgets.map(b => `${b.category}: ₹${b.amount}`).join(', ')}

Provide 3-4 specific, actionable insights about spending patterns, budget utilization, and recommendations for better financial management. Focus on Indian context and use Rupees (₹).`;

    return await this.callGemini(prompt);
  }

  async predictExpenses(expenses: any[]): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const recentExpenses = expenses.slice(0, 30); // Last 30 expenses
    const monthlyData = this.groupExpensesByMonth(recentExpenses);

    const prompt = `Analyze these expense patterns and predict next month's spending. Return JSON format:

Monthly expense data: ${JSON.stringify(monthlyData)}

Return format:
{
  "predictions": {
    "Food": 5000,
    "Transportation": 2000,
    "Shopping": 3000
  },
  "totalPredicted": 15000,
  "confidence": 0.8,
  "insights": ["insight1", "insight2", "insight3"]
}

Predict in Indian Rupees and provide realistic estimates based on patterns.`;

    const response = await this.callGemini(prompt);
    return JSON.parse(response.trim());
  }

  async chatWithFinances(query: string, context: any): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Please add your API key in settings.');
    }

    const prompt = `You are a helpful financial advisor AI assistant for an Indian user. Answer questions about their personal finances using the provided data. Always respond in English and use Indian Rupees (₹).

User Query: "${query}"

Financial Context:
- Total Expenses: ₹${context.totalExpenses || 0}
- Total Budget: ₹${context.totalBudget || 0}
- Recent Expenses: ${context.recentExpenses?.slice(0, 5).map((exp: any) => `₹${exp.amount} on ${exp.category}`).join(', ') || 'No recent expenses'}
- Budget Status: ${context.budgetStatus || 'No budget set'}

Provide helpful, specific advice based on this financial data. Be conversational but informative.`;

    return await this.callGemini(prompt);
  }

  async generateWellnessTips(score: number, financialData: any): Promise<string[]> {
    if (!this.isConfigured()) {
      return [
        'Set a monthly budget to track your spending',
        'Save at least 20% of your income',
        'Review your expenses weekly'
      ];
    }

    const prompt = `Generate 3 personalized financial wellness tips for a user with wellness score ${score}/100. Consider their financial data:

Total Expenses: ₹${financialData.totalExpenses || 0}
Total Savings: ₹${financialData.totalSavings || 0}
Budget Utilization: ${financialData.budgetUtilization || 0}%

Return as JSON array of 3 tips:
["tip1", "tip2", "tip3"]

Focus on actionable advice for Indian users with Rupee amounts.`;

    try {
      const response = await this.callGemini(prompt);
      const tips = JSON.parse(response.trim());
      return Array.isArray(tips) ? tips : [response];
    } catch (error) {
      console.error('Error generating wellness tips:', error);
      return [
        'Set a monthly budget to track your spending',
        'Save at least 20% of your income',
        'Review your expenses weekly'
      ];
    }
  }

  private groupExpensesByMonth(expenses: any[]): Record<string, any> {
    const grouped: Record<string, Record<string, number>> = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {};
      }
      
      const category = expense.category || 'Other';
      grouped[monthKey][category] = (grouped[monthKey][category] || 0) + (Number(expense.amount) || 0);
    });

    return grouped;
  }
}

export const geminiService = GeminiService.getInstance();