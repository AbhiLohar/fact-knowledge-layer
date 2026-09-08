import React from 'react';
import FactCard from './FactCard';
import { Link2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatConfidence } from '../utils';

const typeConfig = {
  CORROBORATES: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Corroboration' },
  CONTRADICTS: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'Contradiction' },
  RECONCILABLE: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Info, label: 'Reconcilable' },
  RELATED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Link2, label: 'Related' }
};

const RelationCard = ({ relation }) => {
  const config = typeConfig[relation.relation_type] || typeConfig.RELATED;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className={`px-4 py-2 flex items-center justify-between border-b ${config.color.replace('text-', 'border-b-')}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <span className="text-xs opacity-80 font-medium">Confidence: {formatConfidence(relation.confidence)}</span>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Visual Connector for desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 border border-gray-200">
           <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
        </div>
        
        <div>
          <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Fact A</div>
          <FactCard fact={relation.fact_a} expandable={false} compact={true} />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Fact B</div>
          <FactCard fact={relation.fact_b} expandable={false} compact={true} />
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">System Reasoning</h4>
        <p className="text-sm text-gray-800">{relation.reasoning}</p>
      </div>
    </div>
  );
};

export default RelationCard;
