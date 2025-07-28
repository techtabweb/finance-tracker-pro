import { useKV } from './use-kv';
import { CategoryLearningPattern, LearningInsight } from '@/lib/types';

export function useCategoryLearning() {
  // Use simple keys without user isolation since we removed auth
  const [learningPatterns, setLearningPatterns] = useKV<CategoryLearningPattern[]>('category-learning-patterns', []);

  // Record a user correction when they manually change a category
  const recordCategoryCorrection = (
    merchant: string,
    description: string,
    userSelectedCategory: string,
    aiSuggestedCategory?: string,
    confidence?: number,
    correctionReason?: string
  ) => {
    const pattern: CategoryLearningPattern = {
      id: Date.now().toString(),
      merchant: merchant.trim(),
      description: description.trim(),
      userSelectedCategory,
      aiSuggestedCategory,
      confidence: confidence || 0,
      timestamp: new Date().toISOString(),
      correctionReason
    };

    setLearningPatterns((current) => [pattern, ...(current || []).slice(0, 999)]); // Keep last 1000 patterns
  };

  // Get personalized category suggestions based on learning patterns
  const getPersonalizedSuggestions = (merchant: string, description: string): LearningInsight[] => {
    const cleanMerchant = merchant.trim().toLowerCase();
    const cleanDescription = description.trim().toLowerCase();
    
    if (!cleanMerchant && !cleanDescription) return [];

    // Group patterns by category
    const categoryGroups = (learningPatterns || []).reduce((groups, pattern) => {
      const category = pattern.userSelectedCategory;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(pattern);
      return groups;
    }, {} as Record<string, CategoryLearningPattern[]>);

    const insights: LearningInsight[] = [];

    Object.entries(categoryGroups).forEach(([category, patterns]) => {
      let score = 0;
      let matchCount = 0;
      const matchedKeywords = new Set<string>();

      // Safe check for patterns
      const patternsArray = Array.isArray(patterns) ? patterns : [];
      
      patternsArray.forEach((pattern) => {
        if (!pattern || typeof pattern !== 'object') return;
        
        const patternMerchant = pattern.merchant?.toLowerCase() || '';
        const patternDescription = pattern.description?.toLowerCase() || '';

        // Exact merchant match (highest weight)
        if (patternMerchant && cleanMerchant && patternMerchant === cleanMerchant) {
          score += 50;
          matchCount++;
          matchedKeywords.add(pattern.merchant);
        }
        // Partial merchant match
        else if (patternMerchant && cleanMerchant && (
          patternMerchant.includes(cleanMerchant) || 
          cleanMerchant.includes(patternMerchant)
        )) {
          score += 25;
          matchCount++;
          matchedKeywords.add(pattern.merchant);
        }

        // Description keyword matching
        const descriptionWords = patternDescription.split(/\s+/).filter(word => word.length > 2);
        const inputWords = cleanDescription.split(/\s+/).filter(word => word.length > 2);
        
        descriptionWords.forEach((word) => {
          if (inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))) {
            score += 10;
            matchedKeywords.add(word);
          }
        });
      });

      // Only include categories with meaningful matches
      if (matchCount > 0 || score >= 20) {
        const confidence = Math.min(95, Math.max(70, score));
        const frequency = patternsArray.length;

        insights.push({
          pattern: `Based on ${matchCount} similar transactions`,
          category,
          frequency,
          confidence,
          keywords: Array.from(matchedKeywords).slice(0, 5)
        });
      }
    });

    // Sort by confidence and frequency, return top 3
    return insights
      .sort((a, b) => (b.confidence * 0.7 + b.frequency * 0.3) - (a.confidence * 0.7 + a.frequency * 0.3))
      .slice(0, 3);
  };

  // Get learning statistics
  const getLearningStats = () => {
    const patterns = learningPatterns || [];
    const totalPatterns = patterns.length;
    const categoriesLearned = new Set(patterns.map(p => p.userSelectedCategory)).size;
    const merchantsLearned = new Set(patterns.map(p => p.merchant.toLowerCase())).size;
    
    // Calculate accuracy of AI suggestions vs user corrections
    const aiSuggestions = patterns.filter(p => p.aiSuggestedCategory);
    const correctAISuggestions = aiSuggestions.filter(p => p.aiSuggestedCategory === p.userSelectedCategory);
    const aiAccuracy = aiSuggestions.length > 0 ? (correctAISuggestions.length / aiSuggestions.length) * 100 : 0;

    return {
      totalPatterns,
      categoriesLearned,
      merchantsLearned,
      aiAccuracy: Math.round(aiAccuracy),
      lastLearning: patterns[0]?.timestamp
    };
  };

  // Get top merchants by category for insights
  const getTopMerchantsByCategory = () => {
    const patterns = learningPatterns || [];
    const merchantsByCategory = patterns.reduce((acc, pattern) => {
      const category = pattern.userSelectedCategory;
      const merchant = pattern.merchant.trim();
      
      if (!merchant) return acc;
      
      if (!acc[category]) {
        acc[category] = {};
      }
      
      acc[category][merchant] = (acc[category][merchant] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const insights: Array<{category: string, merchant: string, frequency: number}> = [];
    
    Object.entries(merchantsByCategory).forEach(([category, merchants]) => {
      if (!merchants || typeof merchants !== 'object') return;
      const topMerchant = Object.entries(merchants)
        .sort(([, a], [, b]) => (typeof b === 'number' ? b : Number(b)) - (typeof a === 'number' ? a : Number(a)))[0];
      
      if (topMerchant && Number(topMerchant[1]) > 1) {
        insights.push({
          category,
          merchant: topMerchant[0],
          frequency: Number(topMerchant[1])
        });
      }
    });

    return insights.sort((a, b) => b.frequency - a.frequency);
  };

  return {
    learningPatterns,
    recordCategoryCorrection,
    getPersonalizedSuggestions,
    getLearningStats,
    getTopMerchantsByCategory
  };
}