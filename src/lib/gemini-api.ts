/**
 * Gemini API Service for Finance Tracker
 * Uses Google's Gemini AI model for receipt scanning and expense categorization
 */

interface GeminiApiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

const CONFIG: GeminiApiConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB83WwA2IAHN4U6Npa44yYPdhtzkEdwtu4',
  model: 'gemini-1.5-flash', // Best free model for vision + text
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
};

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    response_mime_type?: string;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

export async function callGeminiApi(
  prompt: string, 
  options: {
    imageData?: string;
    imageMimeType?: string;
    jsonMode?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const {
    imageData,
    imageMimeType = 'image/jpeg',
    jsonMode = false,
    temperature = 0.1,
    maxTokens = 8192
  } = options;

  // Prepare the request
  const requestBody: GeminiRequest = {
    contents: [{
      parts: []
    }],
    generationConfig: {
      temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: maxTokens,
      ...(jsonMode && { response_mime_type: 'application/json' })
    }
  };

  // Add text prompt
  requestBody.contents[0].parts.push({ text: prompt });

  // Add image if provided
  if (imageData) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageData
      }
    });
  }

  try {
    const url = `${CONFIG.baseUrl}/${CONFIG.model}:generateContent?key=${CONFIG.apiKey}`;
    
    console.log('🤖 Calling Gemini API:', CONFIG.model);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new GeminiApiError(
        `Gemini API request failed: ${response.status} ${response.statusText}\n${errorText}`,
        response.status
      );
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new GeminiApiError('No response candidates returned from Gemini');
    }

    const candidate = data.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new GeminiApiError('Invalid response structure from Gemini');
    }

    const responseText = candidate.content.parts[0].text;
    
    if (!responseText) {
      throw new GeminiApiError('Empty response text from Gemini');
    }

    console.log('✅ Gemini API successful, tokens used:', data.usageMetadata?.totalTokenCount || 'unknown');
    
    return responseText.trim();

  } catch (error) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    
    console.error('❌ Gemini API error:', error);
    throw new GeminiApiError(
      `Network or parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Specific function for receipt scanning
export async function scanReceiptWithGemini(
  imageBase64: string,
  imageMimeType: string = 'image/jpeg'
): Promise<{
  amount: number;
  merchant: string;
  category: string;
  date: string;
  confidence: number;
  items?: string[];
}> {
  const prompt = `You are an advanced OCR and receipt analysis AI specialized in Indian retail and business receipts. Analyze this receipt image and extract structured expense data.

Extract the following information with high accuracy:

1. **Amount**: Total amount paid (look for "Total", "Amount", "Grand Total", etc.)
2. **Merchant/Store Name**: Business name or store name (usually at the top)
3. **Date**: Transaction date (various formats: DD/MM/YYYY, DD-MM-YY, etc.)
4. **Category**: Classify into one of these categories based on merchant and items:
   - Groceries (supermarkets, food items, daily needs)
   - Food & Dining (restaurants, cafes, food delivery)
   - Transportation (fuel, parking, tolls, transport services)
   - Shopping (clothing, electronics, general merchandise)
   - Utilities (mobile recharge, bills, telecom)
   - Healthcare (medicines, medical services)
   - Entertainment (movies, games, subscriptions)
   - Other (if none match)

5. **Items**: List of main items purchased (extract 3-5 key items if visible)
6. **Confidence**: Rate your confidence in the extraction accuracy (70-99%)

Consider these Indian business patterns:
- Common chains: Big Bazaar, Reliance, DMart, Spencer's, More, McDonald's, Domino's, CCD, etc.
- Currency: All amounts in Indian Rupees (₹)
- Date formats: DD/MM/YYYY or DD-MM-YY common in India
- GST numbers, FSSAI numbers may be present
- Hindi/regional language text may be present

Return a JSON object with this exact structure:
{
  "amount": number,
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "items": ["string", "string"],
  "confidence": number
}

If you cannot clearly read certain fields, use your best interpretation based on context clues.`;

  try {
    const response = await callGeminiApi(prompt, {
      imageData: imageBase64,
      imageMimeType,
      jsonMode: true,
      temperature: 0.1
    });

    const extractedData = JSON.parse(response);
    
    // Validate and sanitize the response
    return {
      amount: Math.max(0, Number(extractedData.amount) || 0),
      merchant: String(extractedData.merchant || 'Unknown Merchant').trim(),
      category: String(extractedData.category || 'Other').trim(),
      date: extractedData.date || new Date().toISOString().split('T')[0],
      confidence: Math.min(99, Math.max(70, Number(extractedData.confidence) || 75)),
      items: Array.isArray(extractedData.items) 
        ? extractedData.items.map(item => String(item).trim()).filter(Boolean).slice(0, 5)
        : []
    };

  } catch (error) {
    console.error('Gemini receipt scanning error:', error);
    throw new GeminiApiError(`Receipt scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Specific function for expense categorization
export async function categorizeExpenseWithGemini(
  description: string,
  merchant: string = '',
  availableCategories: string[]
): Promise<Array<{
  category: string;
  confidence: number;
  reason: string;
}>> {
  const prompt = `You are an AI assistant specialized in categorizing Indian expenses and transactions. Analyze the following expense details and suggest the most appropriate categories.

Expense Details:
- Description: "${description}"
- Merchant: "${merchant || 'Unknown'}"

Available Categories:
${availableCategories.map(cat => `- ${cat}`).join('\n')}

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

  try {
    const response = await callGeminiApi(prompt, {
      jsonMode: true,
      temperature: 0.2
    });

    const suggestions = JSON.parse(response);
    
    // Validate and format the response
    return suggestions
      .filter((suggestion: any) => 
        suggestion.category && 
        suggestion.confidence && 
        availableCategories.includes(suggestion.category)
      )
      .map((suggestion: any) => ({
        category: suggestion.category,
        confidence: Math.min(99, Math.max(70, Number(suggestion.confidence))),
        reason: String(suggestion.reason || 'AI suggested match').substring(0, 100)
      }))
      .slice(0, 3);

  } catch (error) {
    console.error('Gemini categorization error:', error);
    throw new GeminiApiError(`Expense categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { CONFIG as GeminiConfig };