// Simple spark compatibility layer for development

interface SparkLLM {
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>;
}

declare global {
  interface Window {
    spark: SparkLLM;
  }
}

// Initialize a simple mock if spark is not available
if (typeof window !== 'undefined' && !window.spark) {
  window.spark = {
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
    }
  };
}

export {};