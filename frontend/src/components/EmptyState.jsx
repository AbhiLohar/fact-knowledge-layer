import React from 'react';

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-850 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 transition-colors">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
    </div>
  );
};

export default EmptyState;
