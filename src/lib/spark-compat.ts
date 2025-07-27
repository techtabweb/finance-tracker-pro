// Complete spark compatibility layer for standalone deployment

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

interface SparkKV {
  keys: () => Promise<string[]>;
  get: <T>(key: string) => Promise<T | undefined>;
  set: <T>(key: string, value: T) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

interface SparkLLM {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>;
  user: () => Promise<UserInfo>;
  kv: SparkKV;
}

declare global {
  interface Window {
    spark: SparkLLM;
  }
}

// Enhanced storage using localStorage with persistence
class EnhancedKVStore {
  private getStorageKey(key: string): string {
    return `finance_tracker_${key}`;
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('finance_tracker_')) {
        keys.push(key.replace('finance_tracker_', ''));
      }
    }
    return keys;
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  }
}

// Gemini AI integration
const GEMINI_API_KEY = 'AIzaSyB83WwA2IAHN4U6Npa44yYPdhtzkEdwtu4';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGeminiAPI(prompt: string, model: string = 'gemini-1.5-flash', jsonMode: boolean = false): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: jsonMode ? `${prompt}\n\nPlease respond with valid JSON only.` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (jsonMode) {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          JSON.parse(jsonMatch[0]);
          return jsonMatch[0];
        } catch {
          // If parsing fails, return a default JSON structure
          return JSON.stringify({
            recommendations: [],
            insights: [],
            predictions: []
          });
        }
      }
      return JSON.stringify({
        recommendations: [],
        insights: [],
        predictions: []
      });
    }
    
    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    
    if (jsonMode) {
      return JSON.stringify({
        recommendations: [],
        insights: [],
        predictions: [],
        error: 'AI service temporarily unavailable'
      });
    }
    
    return 'AI service is temporarily unavailable. Please try again later.';
  }
}

// Initialize spark if not available
if (typeof window !== 'undefined' && !window.spark) {
  const kvStore = new EnhancedKVStore();
  
  window.spark = {
    llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += String(values[i]) + strings[i + 1];
      }
      return result;
    },
    
    llm: async (prompt: string, model?: string, jsonMode?: boolean) => {
      // Use Gemini API for actual AI functionality
      const geminiModel = model === 'gpt-4o' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      return callGeminiAPI(prompt, geminiModel, jsonMode || false);
    },
    
    user: async (): Promise<UserInfo> => ({
      avatarUrl: 'https://ui-avatars.com/api/?name=Finance+User&background=0ea5e9&color=fff',
      email: 'user@financetracker.app',
      id: 'standalone-user',
      isOwner: true,
      login: 'financeuser'
    }),
    
    kv: kvStore
  };
}

// Make spark globally available
if (typeof globalThis !== 'undefined' && !(globalThis as any).spark) {
  (globalThis as any).spark = window.spark;
}

export {};