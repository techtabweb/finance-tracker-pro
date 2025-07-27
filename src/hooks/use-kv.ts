import { useState, useEffect, useCallback } from 'react';

// Simple localStorage-based KV store for client-side data persistence
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((current: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (current: T) => T)(value)
        : newValue;
      
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const deleteValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, deleteValue];
}