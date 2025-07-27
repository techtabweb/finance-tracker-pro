// Compatibility hooks for @github/spark/hooks

import { useState, useEffect, useCallback } from 'react';

// Mock useKV hook that uses localStorage for development
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`spark_kv_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(`spark_kv_${key}`, JSON.stringify(nextValue));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      return nextValue;
    });
  }, [key]);

  const deleteValue = useCallback(() => {
    setValue(defaultValue);
    try {
      localStorage.removeItem(`spark_kv_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }, [key, defaultValue]);

  return [value, updateValue, deleteValue];
}