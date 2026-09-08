import React, { useState, useEffect } from 'react';
import { getRelations } from '../api';
import RelationCard from '../components/RelationCard';
import EmptyState from '../components/EmptyState';
import { GitMerge, Loader2 } from 'lucide-react';

const TABS = [
  { id: 'ALL', label: 'All Relations' },
  { id: 'CORROBORATES', label: 'Corroborations' },
  { id: 'CONTRADICTS', label: 'Contradictions' },
  { id: 'RECONCILABLE', label: 'Reconcilable' },
];

const RelationsPage = () => {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchRelationsData = async () => {
      setLoading(true);
      try {
        const data = await getRelations(activeTab === 'ALL' ? '' : activeTab);
        setRelations(data);
      } catch (err) {
        console.error('Failed to load relations', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelationsData();
  }, [activeTab]);

  return (
    <div className="space-y-6 h-full flex flex-col max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
          Cross-Document Relationships
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Analyze how facts across multiple filings corroborate, contradict, or reconcile through contextual differences.
        </p>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-850 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm w-fit transition-colors">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Relations List */}
      <div className="flex-1 overflow-auto pb-8 pt-1">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="text-xs">Computing cross-document relationships...</span>
          </div>
        ) : relations.length === 0 ? (
          <EmptyState 
            icon={GitMerge} 
            title="No relationships found" 
            description={activeTab === 'ALL' ? "Upload additional documents to automatically detect relationships between facts." : `No ${TABS.find(t=>t.id===activeTab)?.label.toLowerCase()} detected.`} 
          />
        ) : (
          <div className="space-y-4">
            {relations.map(relation => (
              <RelationCard key={relation.id} relation={relation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationsPage;
