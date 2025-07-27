import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely format a number as currency in Indian Rupees
 * @param value - Number to format (can be null, undefined, or NaN)
 * @param defaultValue - Default value if input is invalid (default: 0)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | null | undefined, defaultValue = 0): string {
  try {
    const numValue = Number(value);
    const safeValue = isNaN(numValue) || value === null || value === undefined ? defaultValue : numValue;
    
    // Ensure the value is a valid number before calling toLocaleString
    if (typeof safeValue !== 'number' || !isFinite(safeValue)) {
      return '0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeValue);
  } catch (error) {
    console.error('Error formatting currency:', error, 'Value:', value);
    return '0';
  }
}

/**
 * Safely format a percentage value
 * @param value - Number to format (can be null, undefined, or NaN)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  const numValue = Number(value);
  const safeValue = isNaN(numValue) || value === null || value === undefined ? 0 : numValue;
  return safeValue.toFixed(decimals);
}
