import React from 'react';
import { formatConfidence, getConfidenceBadgeStyle } from '../utils';

const ConfidenceBadge = ({ confidence, className = '' }) => {
  const style = getConfidenceBadgeStyle(confidence);
  const formatted = formatConfidence(confidence);

  return (
    <span className={`${style.container} ${className}`}>
      <span className={style.dot} />
      <span>Confidence: {formatted}</span>
    </span>
  );
};

export default ConfidenceBadge;
