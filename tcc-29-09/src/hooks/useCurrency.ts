import { useState, useEffect } from 'react';
import { CurrencyType, getCurrentCurrency, formatCurrency } from '../utils/currency';

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<CurrencyType>(getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrencyState(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const formatValue = (value: number, options?: { showSymbol?: boolean; minimumFractionDigits?: number }) => {
    return formatCurrency(value, currency, options);
  };

  return {
    currency,
    formatValue,
    formatCurrency: (value: number, options?: { showSymbol?: boolean; minimumFractionDigits?: number }) => 
      formatCurrency(value, currency, options)
  };
};
