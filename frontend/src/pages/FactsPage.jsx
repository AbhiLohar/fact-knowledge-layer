import React, { useState, useEffect, useMemo } from 'react';
import { getFacts, getDocuments } from '../api';
import FactCard from '../components/FactCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { SearchX, Loader2 } from 'lucide-react';

const FactsPage = () => {
  const [allFacts, setAllFacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch facts whenever document_id changes (or on initial load)
  useEffect(() => {
    const fetchFactsData = async () => {
      setLoading(true);
      try {
        const params = { limit: 250 };
        if (filters.document_id) {
          params.document_id = filters.document_id;
        }
        const data = await getFacts(params);
        setAllFacts(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        console.error('Failed to load facts', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactsData();
  }, [filters.document_id]);

  // Instant zero-latency live filtering across category, fact_type, and search query
  const displayedFacts = useMemo(() => {
    let list = allFacts;

    if (filters.category) {
      const catLower = filters.category.toLowerCase();
      list = list.filter(f => (f.category || '').toLowerCase() === catLower);
    }

    if (filters.fact_type) {
      const typeLower = filters.fact_type.toLowerCase();
      list = list.filter(f => (f.fact_type || '').toLowerCase() === typeLower);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(f => {
        const statement = (f.statement || '').toLowerCase();
        const quote = (f.source_quote || '').toLowerCase();
        const val = (f.value || '').toLowerCase();
        const unit = (f.unit || '').toLowerCase();
        const time = (f.time_context || '').toLowerCase();
        const scope = (f.scope_context || '').toLowerCase();
        const doc = (f.document_name || '').toLowerCase();
        const cat = (f.category || '').toLowerCase();
        const type = (f.fact_type || '').toLowerCase();
        const qualifiers = Array.isArray(f.qualifiers) ? f.qualifiers.join(' ').toLowerCase() : '';

        return (
          statement.includes(q) ||
          quote.includes(q) ||
          val.includes(q) ||
          unit.includes(q) ||
          time.includes(q) ||
          scope.includes(q) ||
          doc.includes(q) ||
          cat.includes(q) ||
          type.includes(q) ||
          qualifiers.includes(q)
        );
      });
    }

    return list;
  }, [allFacts, filters.category, filters.fact_type, search]);

  const isFiltered = Boolean(filters.category || filters.fact_type || search.trim());

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
          Fact Explorer
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Browse, search, and verify atomic facts extracted from source documents with grounded citations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <FilterPanel filters={filters} setFilters={setFilters} documents={documents} />
        <div className="w-full md:w-80">
          <SearchBar onSearch={setSearch} placeholder="Search statements, quotes, dates, metrics..." />
        </div>
      </div>

      {/* Meta Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{displayedFacts.length}</strong> of {allFacts.length} extracted facts
          {isFiltered && <span className="ml-1.5 text-indigo-600 dark:text-indigo-400 font-normal">(live filtered)</span>}
        </span>
      </div>

      {/* Facts Card Grid */}
      <div className="flex-1 overflow-auto pb-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading extracted facts...</span>
          </div>
        ) : displayedFacts.length === 0 ? (
          <EmptyState 
            icon={SearchX} 
            title="No matching facts found" 
            description={search ? `No facts matched "${search}". Try adjusting your keywords or clearing the search filter.` : "Try adjusting your filter criteria or ingest additional documents."} 
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {displayedFacts.map(fact => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactsPage;
