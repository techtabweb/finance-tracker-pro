// Enhanced spark compatibility layer for development

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
  const spark: SparkLLM;
}

// Mock storage for development
const mockStorage = new Map<string, any>();

// Initialize a simple mock if spark is not available
if (typeof window !== 'undefined' && !window.spark) {
  window.spark = {
    llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += String(values[i]) + strings[i + 1];
      }
      return result;
    },
    
    llm: async (prompt: string, model?: string, jsonMode?: boolean) => {
      // For development, return a simple mock response
      console.log('Mock LLM call:', { prompt, model, jsonMode });
      
      if (jsonMode) {
        return JSON.stringify({
          recommendations: [],
          insights: [],
          predictions: []
        });
      }
      
      return 'This is a mock response. In production, this would use the actual Spark LLM.';
    },
    
    user: async () => ({
      avatarUrl: 'https://avatars.githubusercontent.com/u/123456?v=4',
      email: 'user@example.com',
      id: 'mock-user-id',
      isOwner: true,
      login: 'mockuser'
    }),
    
    kv: {
      keys: async () => Array.from(mockStorage.keys()),
      get: async <T>(key: string): Promise<T | undefined> => mockStorage.get(key),
      set: async <T>(key: string, value: T): Promise<void> => {
        mockStorage.set(key, value);
      },
      delete: async (key: string): Promise<void> => {
        mockStorage.delete(key);
      }
    }
  };
}

// Make spark globally available
if (typeof globalThis !== 'undefined') {
  (globalThis as any).spark = window.spark;
}

export {};