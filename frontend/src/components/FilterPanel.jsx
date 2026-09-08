import React from 'react';
import { Filter } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, documents }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 pl-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>Filters:</span>
      </div>

      <div className="flex items-center">
        <select 
          name="document_id" 
          value={filters.document_id} 
          onChange={handleChange}
          className="block w-44 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-colors"
        >
          <option value="">All Documents</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.filename}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <select 
          name="category" 
          value={filters.category} 
          onChange={handleChange}
          className="block w-36 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-colors capitalize"
        >
          <option value="">All Categories</option>
          <option value="financial">Financial</option>
          <option value="operational">Operational</option>
          <option value="corporate">Corporate</option>
          <option value="market">Market</option>
          <option value="regulatory">Regulatory</option>
          <option value="personnel">Personnel</option>
          <option value="legal">Legal</option>
        </select>
      </div>

      <div className="flex items-center">
        <select 
          name="fact_type" 
          value={filters.fact_type} 
          onChange={handleChange}
          className="block w-36 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-colors capitalize"
        >
          <option value="">All Types</option>
          <option value="numerical">Numerical</option>
          <option value="temporal">Temporal</option>
          <option value="entity">Entity</option>
          <option value="claim">Claim</option>
          <option value="relationship">Relationship</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
