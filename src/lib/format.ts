export const formatCurrency = (amount: number | null | undefined): string => {
  try {
    const numValue = Number(amount);
    const safeValue = isNaN(numValue) || amount === null || amount === undefined ? 0 : numValue;
    
    if (typeof safeValue !== 'number' || !isFinite(safeValue)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(safeValue);
  } catch (error) {
    console.error('Error formatting currency:', error, 'Amount:', amount);
    return '₹0';
  }
};

export const formatAmount = (amount: number | null | undefined): string => {
  try {
    const numValue = Number(amount);
    const safeValue = isNaN(numValue) || amount === null || amount === undefined ? 0 : numValue;
    
    if (typeof safeValue !== 'number' || !isFinite(safeValue)) {
      return '0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch (error) {
    console.error('Error formatting amount:', error, 'Amount:', amount);
    return '0';
  }
};

export const formatDate = (dateString: string | null | undefined): string => {
  try {
    if (!dateString) {
      return new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    return new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getMonthNameByNumber = (monthNumber: number): string => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleDateString('en-IN', { month: 'long' });
};

export const getLastThreeMonths = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  
  return months;
};