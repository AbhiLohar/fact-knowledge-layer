import React from 'react';

// Simple hash function to generate consistent colors for document names
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
  ];
  return colors[Math.abs(hash) % colors.length];
};

const DocumentBadge = ({ name }) => {
  if (!name) return null;
  const colorClass = stringToColor(name);
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass} max-w-xs truncate`} title={name}>
      {name}
    </span>
  );
};

export default DocumentBadge;
