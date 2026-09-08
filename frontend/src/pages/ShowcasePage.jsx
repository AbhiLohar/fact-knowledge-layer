import React, { useState, useEffect } from 'react';
import { getShowcase } from '../api';
import FactCard from '../components/FactCard';
import ConfidenceBadge from '../components/ConfidenceBadge';
import EmptyState from '../components/EmptyState';
import { Award, AlertTriangle, Loader2, CheckCircle, HelpCircle, Sparkles, AlertOctagon, ArrowRightLeft } from 'lucide-react';
import { formatConfidence } from '../utils';

// Strictly enforced semantic tokens with full dark mode support
const SECTION_CONFIG = {
  corroboration: {
    id: 'corroboration',
    title: '1. Fact Corroboration Across Documents',
    description: 'The same underlying fact is verified across multiple documents, even when expressed differently or using different units.',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800',
    headerBg: 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
    borderAccent: 'border-l-emerald-500',
    icon: CheckCircle,
    label: 'Corroboration'
  },
  contradiction: {
    id: 'contradiction',
    title: '2. Genuine or Likely Contradiction',
    description: 'A genuine factual conflict where two authoritative sources report irreconcilable claims for the same entity and time period.',
    badge: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800',
    headerBg: 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40',
    borderAccent: 'border-l-rose-500',
    icon: AlertTriangle,
    label: 'Contradiction'
  },
  reconcilable: {
    id: 'reconcilable',
    title: '3. Apparent Contradiction Reconciled by Context',
    description: 'An apparent contradiction resolved by examining contextual nuances such as data release vintages, accounting rules, or metric scope.',
    badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800',
    headerBg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
    borderAccent: 'border-l-amber-500',
    icon: HelpCircle,
    label: 'Reconcilable Difference'
  }
};

const ShowcasePage = () => {
  const [showcase, setShowcase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const data = await getShowcase();
        setShowcase(data);
      } catch (err) {
        console.error('Failed to load showcase', err);
        setError('Could not load showcase data. Please verify your backend server is active.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowcase();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        <span className="text-xs">Loading showcase benchmarks...</span>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="pt-12 max-w-2xl mx-auto">
        <EmptyState 
          icon={AlertTriangle} 
          title="Showcase Benchmark Unavailable" 
          description={error || "Showcase data not found."} 
        />
      </div>
    );
  }

  const comparisonSections = [
    { key: 'corroboration', data: showcase.corroboration },
    { key: 'contradiction', data: showcase.contradiction },
    { key: 'reconcilable', data: showcase.reconcilable }
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Linear-style Hero Header */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/80 dark:from-indigo-950/30 via-blue-50/30 dark:via-transparent to-transparent pointer-events-none rounded-bl-full"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 mb-3">
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Evaluation Benchmark
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Four Required Cases Showcase
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Demonstrating how the Fact Knowledge Layer extracts grounded evidence from PDFs, detects genuine discrepancies, and reconciles apparent conflicts using multi-attribute contextual intelligence.
          </p>
        </div>
      </div>

      {/* Comparison Sections (1, 2, and 3) */}
      <div className="space-y-8">
        {comparisonSections.map(({ key, data }) => {
          if (!data) return null;
          const conf = SECTION_CONFIG[key];
          const Icon = conf.icon;

          return (
            <section 
              key={key} 
              className={`bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden border-l-4 ${conf.borderAccent} transition-colors`}
            >
              {/* Section Header with Relationship Badge */}
              <div className={`p-5 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${conf.headerBg}`}>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-xs ${conf.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {conf.label}
                    </span>
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {conf.title}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{conf.description}</p>
                </div>
                {data.confidence && (
                  <ConfidenceBadge confidence={data.confidence} />
                )}
              </div>
              
              {/* Clean Side-by-Side Comparison (Zero Overlap) */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fact A */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Fact A</span>
                      {data.fact_a?.document_name && (
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={data.fact_a.document_name}>
                          {data.fact_a.document_name}
                        </span>
                      )}
                    </div>
                    <FactCard fact={data.fact_a} expandable={true} />
                  </div>

                  {/* Fact B */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Fact B</span>
                      {data.fact_b?.document_name && (
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={data.fact_b.document_name}>
                          {data.fact_b.document_name}
                        </span>
                      )}
                    </div>
                    <FactCard fact={data.fact_b} expandable={true} />
                  </div>
                </div>
              </div>

              {/* System Reasoning Box: Distinct background with subtle gradient top border */}
              <div className="px-6 py-4 bg-blue-50/50 dark:bg-slate-900/60 border-t border-transparent relative">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
                
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    System Reasoning
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                  {data.reasoning}
                </p>
              </div>
            </section>
          );
        })}

        {/* 4. Extraction & Reasoning Failure Section */}
        {showcase.extraction_failure && (
          <section className="bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden border-l-4 border-l-slate-600 transition-colors">
            {/* Header */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  4. Extraction & Reasoning Failure Analysis
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Transparent analysis of real-world PDF failure modes discovered during ingestion and the engineering mitigations applied.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Failure Description */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Failure Identified: {showcase.extraction_failure.failure_description || showcase.extraction_failure.description}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {showcase.extraction_failure.what_went_wrong}
                </p>
              </div>

              {/* Side by Side Root Cause & Mitigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-lg border border-rose-200/80 dark:border-rose-900/40">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Root Cause
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300/90 whitespace-pre-line leading-relaxed">
                    {showcase.extraction_failure.root_cause || showcase.extraction_failure.what_went_wrong}
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200/80 dark:border-emerald-900/40">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    How Handled & Improved
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/90 whitespace-pre-line leading-relaxed">
                    {showcase.extraction_failure.how_we_handled_and_improved || showcase.extraction_failure.improvement}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ShowcasePage;
