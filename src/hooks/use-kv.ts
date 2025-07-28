import { useState, useEffect, useCallback } from 'react';

// Simple localStorage-based key-value storage hook
export function useKV<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Update function
  const updateValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prevValue: T) => T)(prevValue)
        : newValue;
      
      try {
        localStorage.setItem(key, JSON.stringify(nextValue));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
      
      return nextValue;
    });
  }, [key]);

  // Delete function
  const deleteValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error deleting ${key} from localStorage:`, error);
    }
  }, [key, defaultValue]);

  return [value, updateValue, deleteValue, isLoaded] as const;
}