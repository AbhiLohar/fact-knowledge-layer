import React from 'react';
import FactCard from './FactCard';
import { Link2, AlertTriangle, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';
import { formatConfidence } from '../utils';

// Strictly enforced semantic color tokens
const typeConfig = {
  CORROBORATES: { 
    container: 'border-emerald-200',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', 
    icon: CheckCircle, 
    label: 'Corroboration' 
  },
  CONTRADICTS: { 
    container: 'border-rose-200',
    badge: 'text-rose-700 bg-rose-50 border-rose-200', 
    icon: AlertTriangle, 
    label: 'Contradiction' 
  },
  RECONCILABLE: { 
    container: 'border-amber-200',
    badge: 'text-amber-700 bg-amber-50 border-amber-200', 
    icon: HelpCircle, 
    label: 'Reconcilable Difference' 
  },
  RELATED: { 
    container: 'border-slate-200',
    badge: 'text-slate-700 bg-slate-50 border-slate-200', 
    icon: Link2, 
    label: 'Related Subject' 
  }
};

const RelationCard = ({ relation }) => {
  const config = typeConfig[relation.relation_type] || typeConfig.RELATED;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 transition-all duration-150 hover:border-gray-300">
      {/* Top Header with subtle metadata & Confidence */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cross-Document Analysis
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
          Confidence: {formatConfidence(relation.confidence)}
        </span>
      </div>
      
      {/* Comparison Area: Two side-by-side cards with Floating Center Badge */}
      <div className="p-5 relative">
        {/* Floating Semantic Badge centered between Fact A and Fact B */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center gap-1.5 px-3 py-1 rounded-full shadow-sm text-xs font-semibold border backdrop-blur-md bg-white/95 transition-transform hover:scale-105"
             style={{ borderColor: 'inherit' }}>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${config.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>

        {/* Mobile floating badge */}
        <div className="flex md:hidden justify-center mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${config.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>

        {/* Two Side-by-Side Fact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              <span>Fact A</span>
              {relation.fact_a?.document_name && (
                <span className="text-[11px] font-normal text-slate-400 truncate max-w-[180px]">
                  {relation.fact_a.document_name}
                </span>
              )}
            </div>
            <FactCard fact={relation.fact_a} expandable={false} compact={true} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              <span>Fact B</span>
              {relation.fact_b?.document_name && (
                <span className="text-[11px] font-normal text-slate-400 truncate max-w-[180px]">
                  {relation.fact_b.document_name}
                </span>
              )}
            </div>
            <FactCard fact={relation.fact_b} expandable={false} compact={true} />
          </div>
        </div>
      </div>

      {/* System Reasoning Box: Distinct background with subtle gradient top border */}
      <div className="px-5 py-4 bg-blue-50/50 border-t border-transparent relative">
        {/* Subtle gradient highlight line along the top border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
        
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            System Reasoning
          </h4>
        </div>
        <p className="text-xs md:text-sm text-slate-700 leading-relaxed pl-5">
          {relation.reasoning}
        </p>
      </div>
    </div>
  );
};

export default RelationCard;
