import React from 'react';
import FactCard from './FactCard';
import ConfidenceBadge from './ConfidenceBadge';
import { Link2, AlertTriangle, CheckCircle, HelpCircle, Sparkles, ArrowRightLeft } from 'lucide-react';
import { formatConfidence } from '../utils';

// Semantic color tokens with full dark mode support
const typeConfig = {
  CORROBORATES: { 
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800', 
    headerBg: 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
    icon: CheckCircle, 
    label: 'Corroboration' 
  },
  CONTRADICTS: { 
    badge: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800', 
    headerBg: 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40',
    icon: AlertTriangle, 
    label: 'Contradiction' 
  },
  RECONCILABLE: { 
    badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800', 
    headerBg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
    icon: HelpCircle, 
    label: 'Reconcilable Difference' 
  },
  RELATED: { 
    badge: 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700', 
    headerBg: 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800',
    icon: Link2, 
    label: 'Related Subject' 
  }
};

const RelationCard = ({ relation }) => {
  const config = typeConfig[relation.relation_type] || typeConfig.RELATED;
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-colors">
      {/* Prominent Relationship Header Bar - No Overlap */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${config.headerBg}`}>
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-xs ${config.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            Cross-Document Verification
          </span>
        </div>
        
        <ConfidenceBadge confidence={relation.confidence} />
      </div>
      
      {/* Side-by-Side Cards without any floating collision */}
      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fact A Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Fact A</span>
              {relation.fact_a?.document_name && (
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={relation.fact_a.document_name}>
                  {relation.fact_a.document_name}
                </span>
              )}
            </div>
            <FactCard fact={relation.fact_a} expandable={false} compact={true} />
          </div>

          {/* Fact B Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Fact B</span>
              {relation.fact_b?.document_name && (
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={relation.fact_b.document_name}>
                  {relation.fact_b.document_name}
                </span>
              )}
            </div>
            <FactCard fact={relation.fact_b} expandable={false} compact={true} />
          </div>
        </div>
      </div>

      {/* System Reasoning Box: Distinct background with subtle gradient top border */}
      <div className="px-5 py-4 bg-blue-50/50 dark:bg-slate-900/60 border-t border-transparent relative">
        {/* Subtle gradient highlight line along the top border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
        
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
            System Reasoning
          </h4>
        </div>
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
          {relation.reasoning}
        </p>
      </div>
    </div>
  );
};

export default RelationCard;
