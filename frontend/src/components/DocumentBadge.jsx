import React from 'react';
import { FileText } from 'lucide-react';

const DocumentBadge = ({ name }) => {
  if (!name) return null;

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 max-w-[220px] truncate transition-colors" 
      title={name}
    >
      <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
};

export default DocumentBadge;
