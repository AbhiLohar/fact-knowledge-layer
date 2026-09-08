import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  if (normStatus === 'processing' || normStatus === 'pending' || normStatus === 'extracting' || normStatus === 'analyzing' || normStatus === 'comparing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
        <span className="capitalize">{normStatus}</span>
      </span>
    );
  }
  if (normStatus === 'error' || normStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
        <XCircle className="w-3 h-3 text-rose-500" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      Complete
    </span>
  );
};

export default StatusBadge;
