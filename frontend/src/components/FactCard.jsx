import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';
import DocumentBadge from './DocumentBadge';
import { formatConfidence } from '../utils';

const categoryColors = {
  financial: 'bg-blue-100 text-blue-800',
  operational: 'bg-green-100 text-green-800',
  corporate: 'bg-purple-100 text-purple-800',
  market: 'bg-orange-100 text-orange-800',
  regulatory: 'bg-red-100 text-red-800',
  personnel: 'bg-teal-100 text-teal-800',
  legal: 'bg-gray-100 text-gray-800',
  default: 'bg-gray-100 text-gray-800'
};

const FactCard = ({ fact, expandable = true, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  const catColor = categoryColors[fact.category?.toLowerCase()] || categoryColors.default;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${catColor}`}>
            {fact.category}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {fact.fact_type}
          </span>
          {fact.document_name && (
            <DocumentBadge name={fact.document_name} />
          )}
        </div>
        {!compact && (
          <span className="text-xs text-gray-400 font-medium">Confidence: {formatConfidence(fact.confidence)}</span>
        )}
      </div>

      <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>
        {fact.statement}
      </h3>

      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 ${compact ? 'mb-0' : 'mb-3'}`}>
        {fact.time_context && <span><span className="font-medium text-gray-600">Time:</span> {fact.time_context}</span>}
        {fact.scope_context && <span><span className="font-medium text-gray-600">Scope:</span> {fact.scope_context}</span>}
        {(fact.value || fact.unit) && (
          <span className="font-medium text-indigo-600">
            Value: {fact.value} {fact.unit}
          </span>
        )}
      </div>

      {expandable && (
        <div className="mt-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide Source' : 'View Source'}
          </button>
          
          {expanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 border-l-2 border-indigo-300">
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="italic">"{fact.source_quote}"</p>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>Page {fact.page_number}</span>
                {fact.qualifiers && fact.qualifiers.length > 0 && (
                  <span>Qualifiers: {fact.qualifiers.join(', ')}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!expandable && fact.source_quote && (
         <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-indigo-200">
           <p className="italic line-clamp-3">"{fact.source_quote}"</p>
         </div>
      )}
    </div>
  );
};

export default FactCard;
