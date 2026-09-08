import React from 'react';

const FilterPanel = ({ filters, setFilters, documents }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Document</label>
        <select 
          name="document_id" 
          value={filters.document_id} 
          onChange={handleChange}
          className="block w-48 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md border"
        >
          <option value="">All Documents</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.filename}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Category</label>
        <select 
          name="category" 
          value={filters.category} 
          onChange={handleChange}
          className="block w-40 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md border"
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

      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Type</label>
        <select 
          name="fact_type" 
          value={filters.fact_type} 
          onChange={handleChange}
          className="block w-40 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md border"
        >
          <option value="">All Types</option>
          <option value="metric">Metric</option>
          <option value="event">Event</option>
          <option value="claim">Claim</option>
          <option value="entity">Entity</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
