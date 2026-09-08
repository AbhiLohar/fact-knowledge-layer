import React, { useState, useEffect } from 'react';
import { getRelations } from '../api';
import RelationCard from '../components/RelationCard';
import EmptyState from '../components/EmptyState';
import { GitMerge, Loader2 } from 'lucide-react';

const TABS = [
  { id: 'ALL', label: 'All Relations', color: 'bg-gray-100 text-gray-800' },
  { id: 'CORROBORATES', label: 'Corroborations', color: 'bg-green-100 text-green-800' },
  { id: 'CONTRADICTS', label: 'Contradictions', color: 'bg-red-100 text-red-800' },
  { id: 'RECONCILABLE', label: 'Reconcilable', color: 'bg-amber-100 text-amber-800' },
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
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cross-Document Relations</h1>
        <p className="text-gray-500">Discover how facts across different documents corroborate or contradict each other.</p>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600 -mb-[9px] pb-[9px] z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto pb-8 pt-2">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : relations.length === 0 ? (
          <EmptyState 
            icon={GitMerge} 
            title="No relations found" 
            description={activeTab === 'ALL' ? "Upload more documents to discover relationships between facts." : `No ${TABS.find(t=>t.id===activeTab)?.label.toLowerCase()} found.`} 
          />
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
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
