// Utility functions for currency formatting

export type CurrencyType = 'BRL' | 'USD' | 'EUR';

export const getCurrencySymbol = (currency: CurrencyType): string => {
  switch (currency) {
    case 'BRL': return 'R$';
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return 'R$';
  }
};

export const getCurrencyLocale = (currency: CurrencyType): string => {
  switch (currency) {
    case 'BRL': return 'pt-BR';
    case 'USD': return 'en-US';
    case 'EUR': return 'de-DE';
    default: return 'pt-BR';
  }
};

export const formatCurrency = (
  value: number, 
  currency: CurrencyType = 'BRL',
  options: { 
    showSymbol?: boolean;
    minimumFractionDigits?: number;
  } = {}
): string => {
  const { showSymbol = true, minimumFractionDigits = 2 } = options;
  
  if (showSymbol) {
    const locale = getCurrencyLocale(currency);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
    }).format(value);
  } else {
    const locale = getCurrencyLocale(currency);
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
    }).format(value);
  }
};

export const getCurrentCurrency = (): CurrencyType => {
  return (localStorage.getItem('currency') as CurrencyType) || 'BRL';
};

export const setCurrency = (currency: CurrencyType): void => {
  localStorage.setItem('currency', currency);
  // Dispatch custom event to notify components of currency change
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
};
