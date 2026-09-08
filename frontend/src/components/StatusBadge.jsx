import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'processing' || status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Loader2 className="w-3 h-3 animate-spin" />
        Processing
      </span>
    );
  }
  if (status === 'error' || status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle2 className="w-3 h-3" />
      Complete
    </span>
  );
};

export default StatusBadge;
