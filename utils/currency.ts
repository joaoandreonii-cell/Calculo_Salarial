export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formats a string like "123456" into "1.234,56"
export const formatCurrencyInput = (value: string): string => {
  if (!value) return '';
  
  // Remove everything that is not a digit
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';

  // Divide by 100 to treat as cents
  const amount = parseFloat(numericValue) / 100;

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Parses "1.234,56" back to 1234.56
export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  // Remove dots (thousands separators)
  const cleanValue = value.replace(/\./g, '');
  // Replace comma with dot (decimal separator)
  const standardValue = cleanValue.replace(',', '.');
  // Parse
  return parseFloat(standardValue) || 0;
};