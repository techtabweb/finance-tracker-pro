import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategoryLearning } from '@/hooks/use-category-learning';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, CheckCircle, Robot, Brain, Star } from '@phosphor-icons/react';

interface CategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
  source: 'ai' | 'learned' | 'rule';
}

interface SmartCategorizerProps {
  description: string;
  merchant?: string;
  categories: Array<{ id: string; name: string; color: string }>;
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
  onLearningRecord?: (category: string, aiSuggestion?: string, confidence?: number) => void;
}

export function SmartCategorizer({ 
  description, 
  merchant, 
  categories, 
  onCategorySelect, 
  selectedCategory,
  onLearningRecord
}: SmartCategorizerProps) {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAiSuggestion, setLastAiSuggestion] = useState<string | undefined>();
  const isMobile = useIsMobile();
  const { getPersonalizedSuggestions, recordCategoryCorrection } = useCategoryLearning();

  // Get personalized suggestions on input change
  useEffect(() => {
    if (description.trim() || merchant?.trim()) {
      const learnedSuggestions = getPersonalizedSuggestions(merchant || '', description);
      
      if (learnedSuggestions.length > 0) {
        const personalizedSuggestions: CategorySuggestion[] = learnedSuggestions.map(insight => ({
          category: insight.category,
          confidence: insight.confidence,
          reason: `${insight.pattern} (${insight.keywords.slice(0, 2).join(', ')})`,
          source: 'learned' as const
        }));
        
        setSuggestions(personalizedSuggestions);
      }
    }
  }, [description, merchant, getPersonalizedSuggestions]);

  const handleCategorySelection = (category: string, suggestion?: CategorySuggestion) => {
    onCategorySelect(category);
    
    // Record learning pattern when user selects a category
    if (suggestion?.source === 'ai' && suggestion.category !== category) {
      // User corrected AI suggestion
      recordCategoryCorrection(
        merchant || '',
        description,
        category,
        suggestion.category,
        suggestion.confidence,
        'User corrected AI suggestion'
      );
    } else if (!suggestion || suggestion.source !== 'learned') {
      // User made a manual selection or chose a non-learned suggestion
      recordCategoryCorrection(
        merchant || '',
        description,
        category,
        lastAiSuggestion,
        undefined,
        suggestion ? `Selected ${suggestion.source} suggestion` : 'Manual selection'
      );
    }
    
    // Notify parent component
    onLearningRecord?.(category, lastAiSuggestion, suggestion?.confidence);
  };

  const analyzeForCategory = async () => {
    if (!description.trim() && !merchant?.trim()) return;

    setIsAnalyzing(true);
    
    try {
      // Create AI prompt for intelligent categorization
      const prompt = spark.llmPrompt`
You are an AI assistant specialized in categorizing Indian expenses and transactions. Analyze the following expense details and suggest the most appropriate categories.

Expense Details:
- Description: "${description}"
- Merchant: "${merchant || 'Unknown'}"

Available Categories:
${categories.map(cat => `- ${cat.name}`).join('\n')}

Consider these factors:
1. Merchant name and type of business
2. Keywords in the description
3. Common Indian shopping patterns and brands
4. Regional variations and local businesses

For each relevant category, provide:
1. Category name (must match exactly from the available list)
2. Confidence score (70-99%)
3. Brief reason for the suggestion

Return a JSON array with up to 3 suggestions, ordered by confidence:
[
  {
    "category": "exact category name",
    "confidence": number,
    "reason": "brief explanation"
  }
]

Focus on accuracy and relevance to Indian context.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const aiSuggestions = JSON.parse(response);
      
      // Validate and format the AI response
      const validSuggestions: CategorySuggestion[] = aiSuggestions
        .filter((suggestion: any) => 
          suggestion.category && 
          suggestion.confidence && 
          categories.some(cat => cat.name === suggestion.category)
        )
        .map((suggestion: any) => ({
          category: suggestion.category,
          confidence: Math.min(99, Math.max(70, Number(suggestion.confidence))),
          reason: String(suggestion.reason || 'AI suggested match').substring(0, 100),
          source: 'ai' as const
        }))
        .slice(0, 3);

      // Store the top AI suggestion for learning
      if (validSuggestions.length > 0) {
        setLastAiSuggestion(validSuggestions[0].category);
      }

      // Combine with existing learned suggestions, prioritizing learned ones
      const existingLearned = suggestions.filter(s => s.source === 'learned');
      const combinedSuggestions = [
        ...existingLearned,
        ...validSuggestions.filter(ai => !existingLearned.some(learned => learned.category === ai.category))
      ].slice(0, 3);

      setSuggestions(combinedSuggestions);
      
    } catch (error) {
      console.error('AI categorization error:', error);
      
      // Fallback to rule-based categorization
      const categoryRules = {
        'Food & Dining': {
          keywords: ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'dining', 'domino', 'mcdonald', 'kfc', 'subway', 'zomato', 'swiggy'],
          confidence: 95
        },
        'Groceries': {
          keywords: ['supermarket', 'grocery', 'bazaar', 'mart', 'fresh', 'vegetables', 'rice', 'dal', 'milk', 'bread', 'reliance', 'big bazaar', 'dmart'],
          confidence: 90
        },
        'Transportation': {
          keywords: ['petrol', 'diesel', 'fuel', 'gas', 'station', 'uber', 'ola', 'taxi', 'bus', 'metro', 'train', 'toll', 'parking', 'bpcl', 'hp', 'indian oil'],
          confidence: 85
        },
        'Shopping': {
          keywords: ['clothes', 'shoes', 'electronics', 'shopping', 'mall', 'store', 'myntra', 'flipkart', 'amazon', 'brand'],
          confidence: 80
        },
        'Utilities': {
          keywords: ['recharge', 'bill', 'electricity', 'water', 'gas', 'internet', 'mobile', 'airtel', 'jio', 'vodafone', 'tata sky', 'dish'],
          confidence: 85
        },
        'Healthcare': {
          keywords: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'clinic', 'apollo', 'health'],
          confidence: 88
        },
        'Entertainment': {
          keywords: ['movie', 'cinema', 'game', 'entertainment', 'netflix', 'spotify', 'booking', 'ticket'],
          confidence: 82
        }
      };

      const text = `${description} ${merchant || ''}`.toLowerCase();
      const matchedCategories: CategorySuggestion[] = [];

      Object.entries(categoryRules).forEach(([category, rules]) => {
        const matchCount = rules.keywords.filter(keyword => text.includes(keyword)).length;
        if (matchCount > 0) {
          const confidence = Math.min(rules.confidence + (matchCount - 1) * 5, 99);
          const matchedKeywords = rules.keywords.filter(keyword => text.includes(keyword));
          matchedCategories.push({
            category,
            confidence,
            reason: `Detected keywords: ${matchedKeywords.slice(0, 2).join(', ')}`,
            source: 'rule' as const
          });
        }
      });

      // Sort by confidence and take top 3
      const topSuggestions = matchedCategories
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .filter(suggestion => categories.some(cat => cat.name === suggestion.category));

      // Combine with existing learned suggestions
      const existingLearned = suggestions.filter(s => s.source === 'learned');
      const combinedSuggestions = [
        ...existingLearned,
        ...topSuggestions.filter(rule => !existingLearned.some(learned => learned.category === rule.category))
      ].slice(0, 3);

      setSuggestions(combinedSuggestions);
    }
    
    setIsAnalyzing(false);
  };

  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || '#6b7280';
  };

  const getSuggestionIcon = (source: 'ai' | 'learned' | 'rule') => {
    switch (source) {
      case 'learned':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'ai':
        return <Robot className="w-4 h-4 text-blue-500" />;
      case 'rule':
        return <Sparkle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getSuggestionBadge = (source: 'ai' | 'learned' | 'rule') => {
    switch (source) {
      case 'learned':
        return { text: 'Learned', className: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'ai':
        return { text: 'AI', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'rule':
        return { text: 'Pattern', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
  };

  if (!description.trim() && !merchant?.trim()) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Show learned suggestions if available */}
      {suggestions.some(s => s.source === 'learned') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-purple-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">Personal Learning</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                </div>

                <div className="space-y-2">
                  {suggestions.filter(s => s.source === 'learned').map((suggestion, index) => (
                    <motion.div
                      key={suggestion.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        type="button"
                        variant={selectedCategory === suggestion.category ? "default" : "outline"}
                        onClick={() => handleCategorySelection(suggestion.category, suggestion)}
                        className="w-full justify-start p-3 h-auto"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-200"
                              style={{ backgroundColor: getCategoryColor(suggestion.category) }}
                            />
                            <div className="text-left">
                              <div className="font-medium">{suggestion.category}</div>
                              <div className="text-xs text-gray-600">{suggestion.reason}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSuggestionBadge(suggestion.source).className}>
                              {getSuggestionBadge(suggestion.source).text}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.confidence}%
                            </Badge>
                            {selectedCategory === suggestion.category && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Analysis Button */}
      {suggestions.length === 0 && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            type="button"
            variant="outline" 
            onClick={analyzeForCategory}
            className={`w-full ${isMobile ? 'h-10' : 'h-9'} text-sm bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100`}
          >
            <Sparkle className="w-4 h-4 mr-2" />
            Get AI Category Suggestions (GPT-4o)
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <Robot className="w-6 h-6 text-purple-500 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-700 text-sm">Analyzing...</p>
                    <p className="text-xs text-purple-600">AI is suggesting categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {suggestions.filter(s => s.source !== 'learned').length > 0 && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Robot className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">AI & Pattern Suggestions</span>
                  </div>

                  <div className="space-y-2">
                    {suggestions.filter(s => s.source !== 'learned').map((suggestion, index) => (
                      <motion.div
                        key={suggestion.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          type="button"
                          variant={selectedCategory === suggestion.category ? "default" : "outline"}
                          onClick={() => handleCategorySelection(suggestion.category, suggestion)}
                          className="w-full justify-start p-3 h-auto"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              {getSuggestionIcon(suggestion.source)}
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: getCategoryColor(suggestion.category) }}
                              />
                              <div className="text-left">
                                <div className="font-medium">{suggestion.category}</div>
                                <div className="text-xs text-gray-600">{suggestion.reason}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSuggestionBadge(suggestion.source).className}>
                                {getSuggestionBadge(suggestion.source).text}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.confidence}%
                              </Badge>
                              {selectedCategory === suggestion.category && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSuggestions(suggestions.filter(s => s.source === 'learned'))}
                    className="w-full text-xs text-gray-500"
                  >
                    Hide AI suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}