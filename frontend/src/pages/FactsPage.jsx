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
        params.limit = 100; // Just fetching a batch for simplicity in UI
        
        const data = await getFacts(params);
        // Assuming API returns { items: [...], total: X } or just array
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fact Explorer</h1>
        <p className="text-gray-500">Browse and filter all facts extracted from your documents.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterPanel filters={filters} setFilters={setFilters} documents={documents} />
        <div className="w-full md:w-64">
          <SearchBar onSearch={setSearch} placeholder="Search statements..." />
        </div>
      </div>

      <div className="text-sm text-gray-500 font-medium">
        Showing {facts.length} {facts.length !== total && total > 0 ? `of ${total}` : ''} facts
      </div>

      <div className="flex-1 overflow-auto pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : facts.length === 0 ? (
          <EmptyState 
            icon={SearchX} 
            title="No facts found" 
            description="Try adjusting your filters or search query, or upload more documents." 
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
