/**
 * Simple test to verify Gemini API integration
 * This file can be run to test the API before using in components
 */

import { callGeminiApi, categorizeExpenseWithGemini, GeminiApiError } from './gemini-api';

// Test basic text generation
export async function testGeminiTextGeneration() {
  console.log('🧪 Testing Gemini text generation...');
  
  try {
    const response = await callGeminiApi(
      'Categorize this expense for an Indian user: "Paid ₹450 at McDonald\'s for lunch". Return just the category name from: Groceries, Food & Dining, Transportation, Shopping, Utilities, Healthcare, Entertainment, Other',
      { temperature: 0.1 }
    );
    
    console.log('✅ Gemini text test successful:', response);
    return response;
  } catch (error) {
    if (error instanceof GeminiApiError) {
      console.error('❌ Gemini API error:', error.message, error.status);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    throw error;
  }
}

// Test expense categorization
export async function testExpenseCategorization() {
  console.log('🧪 Testing expense categorization...');
  
  try {
    const suggestions = await categorizeExpenseWithGemini(
      'Lunch at McDonald\'s',
      'McDonald\'s',
      ['Groceries', 'Food & Dining', 'Transportation', 'Shopping', 'Utilities', 'Healthcare', 'Entertainment', 'Other']
    );
    
    console.log('✅ Categorization test successful:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('❌ Categorization test failed:', error);
    throw error;
  }
}

// API key validation
export function validateApiKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB83WwA2IAHN4U6Npa44yYPdhtzkEdwtu4';
  
  if (!apiKey || apiKey.length < 30) {
    throw new Error('Invalid Gemini API key');
  }
  
  console.log('✅ API key format is valid');
  return true;
}

// Usage instructions
export function printUsageInstructions() {
  console.log(`
🤖 Gemini AI Integration Summary:

API Key: Environment variable VITE_GEMINI_API_KEY (fallback included for development)
Model: gemini-1.5-flash (Free tier with vision capabilities)

Features Implemented:
1. Receipt Scanning - Extract amount, merchant, date, category from receipt images
2. Expense Categorization - Smart categorization based on description and merchant

Components Updated:
- ReceiptScanner.tsx - Now uses Gemini for receipt OCR
- SmartCategorizer.tsx - Now uses Gemini for intelligent categorization

API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

Rate Limits (Free Tier):
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

Error Handling:
- Graceful fallback to rule-based categorization
- Comprehensive error logging
- Network timeout handling

To test the integration manually:
1. Add an expense with receipt scanning
2. Try smart categorization with various merchants
3. Check browser console for API call logs

The AI will improve suggestions based on Indian context and common spending patterns.
  `);
}

// Export all test functions
export const GeminiTester = {
  testGeminiTextGeneration,
  testExpenseCategorization,
  validateApiKey,
  printUsageInstructions
};