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

export const getConfidenceLevel = (confidence) => {
  if (confidence === null || confidence === undefined || confidence === '') return 'high';
  if (typeof confidence === 'number') {
    const val = confidence <= 1 ? confidence * 100 : confidence;
    if (val >= 80) return 'high';
    if (val >= 55) return 'medium';
    return 'low';
  }
  const str = String(confidence).toLowerCase().trim();
  if (str.includes('high') || str.includes('8') || str.includes('9') || str.includes('100')) return 'high';
  if (str.includes('med') || str.includes('6') || str.includes('7')) return 'medium';
  if (str.includes('low') || str.includes('4') || str.includes('3') || str.includes('2') || str.includes('1')) return 'low';
  return 'high';
};

export const getConfidenceBadgeStyle = (confidence) => {
  const level = getConfidenceLevel(confidence);
  if (level === 'high') {
    return {
      container: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 shadow-xs flex-shrink-0',
      dot: 'w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse',
      level: 'high'
    };
  }
  if (level === 'medium') {
    return {
      container: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 shadow-xs flex-shrink-0',
      dot: 'w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400',
      level: 'medium'
    };
  }
  return {
    container: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 shadow-xs flex-shrink-0',
    dot: 'w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400',
    level: 'low'
  };
};

