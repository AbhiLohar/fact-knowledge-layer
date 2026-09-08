import React, { useState, useEffect } from 'react';
import { getFacts, getDocuments } from '../api';
import FactCard from '../components/FactCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { SearchX, Loader2 } from 'lucide-react';

const FactsPage = () => {
  const [facts, setFacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    document_id: '',
    category: '',
    fact_type: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to load documents', err);
      }
    };
    loadDocs();
  }, []);

  useEffect(() => {
    const fetchFactsData = async () => {
      setLoading(true);
      try {
        const params = { ...filters };
        if (search) params.search = search;
        params.limit = 100;
        
        const data = await getFacts(params);
        if (Array.isArray(data)) {
           setFacts(data);
           setTotal(data.length);
        } else {
           setFacts(data.items || []);
           setTotal(data.total || data.items?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load facts', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactsData();
  }, [filters, search]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">
          Fact Explorer
        </h1>
        <p className="text-sm text-gray-500">
          Browse, search, and verify atomic facts extracted from source documents with grounded citations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <FilterPanel filters={filters} setFilters={setFilters} documents={documents} />
        <div className="w-full md:w-72">
          <SearchBar onSearch={setSearch} placeholder="Search statements..." />
        </div>
      </div>

      {/* Meta Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{facts.length}</strong> {facts.length !== total && total > 0 ? `of ${total}` : ''} extracted facts
        </span>
      </div>

      {/* Facts Card Grid */}
      <div className="flex-1 overflow-auto pb-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading extracted facts...</span>
          </div>
        ) : facts.length === 0 ? (
          <EmptyState 
            icon={SearchX} 
            title="No facts found" 
            description="Try adjusting your filter criteria or search keywords, or ingest additional documents." 
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {facts.map(fact => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactsPage;
