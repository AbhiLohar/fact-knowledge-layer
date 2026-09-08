/**
 * Safely formats confidence values into a readable label or percentage without ever returning NaN.
 * Handles numbers (e.g. 0.95 -> '95%'), numeric strings ('0.95' -> '95%'),
 * and categorical strings ('high' -> 'High', 'medium' -> 'Medium', 'low' -> 'Low').
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined || confidence === '') {
    return 'High';
  }

  // If already a valid number
  if (typeof confidence === 'number') {
    if (isNaN(confidence)) return 'High';
    return `${Math.round(confidence <= 1 ? confidence * 100 : confidence)}%`;
  }

  const str = String(confidence).trim();

  // If it's a numeric string like "0.95" or "95"
  const num = parseFloat(str);
  if (!isNaN(num) && !/[a-zA-Z]/.test(str)) {
    if (num <= 1 && num > 0) {
      return `${Math.round(num * 100)}%`;
    }
    return `${Math.round(num)}%`;
  }

  // Handle categorical text
  const lower = str.toLowerCase();
  if (lower === 'high') return 'High';
  if (lower === 'medium') return 'Medium';
  if (lower === 'low') return 'Low';

  return str.charAt(0).toUpperCase() + str.slice(1);
};
