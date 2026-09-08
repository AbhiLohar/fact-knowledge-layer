import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, Calendar, Globe } from 'lucide-react';
import DocumentBadge from './DocumentBadge';
import { formatConfidence } from '../utils';

const categoryStyles = {
  financial: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  operational: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  corporate: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  market: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
  regulatory: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  personnel: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
  legal: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  default: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
};

const FactCard = ({ fact, expandable = true, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  const catStyle = categoryStyles[fact.category?.toLowerCase()] || categoryStyles.default;

  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-lg border border-gray-200 dark:border-slate-700/80 shadow-sm transition-all duration-150 hover:border-gray-300 dark:hover:border-slate-600 ${compact ? 'p-3.5' : 'p-5'}`}>
      {/* Top Meta Bar */}
      <div className="flex justify-between items-center mb-2.5 gap-2">
        <div className="flex flex-wrap gap-1.5 items-center min-w-0">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${catStyle} capitalize flex-shrink-0`}>
            {fact.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600 capitalize flex-shrink-0">
            {fact.fact_type}
          </span>
          {fact.document_name && (
            <DocumentBadge name={fact.document_name} />
          )}
        </div>
        {!compact && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200/60 dark:border-slate-700 flex-shrink-0">
            Confidence: {formatConfidence(fact.confidence)}
          </span>
        )}
      </div>

      {/* Main Fact Statement */}
      <h3 className={`font-medium text-slate-900 dark:text-slate-100 leading-snug tracking-tight ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
        {fact.statement}
      </h3>

      {/* Context Pills (Value, Time, Scope formatted as crisp pill badges) */}
      <div className="flex flex-wrap gap-1.5 items-center mb-2">
        {(fact.value || fact.unit) && (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80">
            <span className="text-indigo-400 dark:text-indigo-400 mr-1 font-normal">Val:</span> {fact.value} {fact.unit}
          </span>
        )}
        {fact.time_context && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200/70 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{fact.time_context}</span>
          </span>
        )}
        {fact.scope_context && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200/70 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600">
            <Globe className="w-3 h-3 text-slate-400" />
            <span>{fact.scope_context}</span>
          </span>
        )}
      </div>

      {/* Expandable Verbatim Source Quote Block */}
      {expandable && (
        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-700/60">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? 'Hide Source Evidence' : 'View Source Evidence'}</span>
          </button>
          
          {expanded && (
            <div className="mt-2.5">
              <blockquote className="border-l-2 border-indigo-500 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-2.5 rounded-r-lg text-xs text-slate-700 dark:text-slate-300 italic">
                <div className="flex gap-2 items-start">
                  <Quote className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5 not-italic" />
                  <p className="leading-relaxed">"{fact.source_quote}"</p>
                </div>
              </blockquote>
              <div className="mt-1.5 px-1 text-[11px] text-slate-400 flex justify-between items-center">
                <span>Page {fact.page_number || 'N/A'}</span>
                {fact.qualifiers && fact.qualifiers.length > 0 && (
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    [{fact.qualifiers.join(', ')}]
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!expandable && fact.source_quote && (
        <blockquote className="mt-2 border-l-2 border-indigo-400/70 bg-slate-50/80 dark:bg-slate-900/80 px-2.5 py-2 rounded-r text-xs text-slate-700 dark:text-slate-300 italic">
          <p className="line-clamp-2">"{fact.source_quote}"</p>
        </blockquote>
      )}
    </div>
  );
};

export default FactCard;
