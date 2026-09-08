import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, Trash2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument } from '../api';
import StatusBadge from '../components/StatusBadge';

const UploadPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Auto-refresh if any doc is processing
    const interval = setInterval(() => {
      setDocuments((currentDocs) => {
        const hasProcessing = currentDocs.some(d => 
          d.status === 'processing' || d.status === 'pending' || 
          d.status === 'EXTRACTING' || d.status === 'ANALYZING' || d.status === 'COMPARING'
        );
        if (hasProcessing) {
          fetchDocuments();
        }
        return currentDocs;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF document.');
      return;
    }
    
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this document and all associated facts?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(d => d.id !== id));
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const isAnyProcessing = documents.some(d => 
    d.status === 'processing' || d.status === 'pending' || 
    d.status === 'EXTRACTING' || d.status === 'ANALYZING' || d.status === 'COMPARING'
  ) || uploading;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
          Document Ingestion
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Upload PDF filings and reports to extract grounded facts and detect cross-document relationships.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 p-4 rounded-xl flex items-center gap-3 border border-rose-200 dark:border-rose-900 shadow-sm text-sm">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Premium Linear-style Dropzone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-10 md:p-14 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragging 
            ? 'border-indigo-500 bg-blue-50/60 dark:bg-indigo-950/40 shadow-sm' 
            : isAnyProcessing
              ? 'border-indigo-400 bg-blue-50/30 dark:bg-indigo-950/20 animate-pulse'
              : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-blue-50/40 dark:hover:bg-slate-800 shadow-sm'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isDragging || uploading 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200/80 dark:border-slate-700'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {uploading ? 'Processing PDF pipeline...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Supports corporate filings, annual reports, financial presentations, and surveys (PDF up to 100 pages)
            </p>
          </div>

          {isAnyProcessing && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mt-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Pipeline active: extracting text, tables, and atomic facts</span>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ingested Documents ({documents.length})
          </h2>
          {isAnyProcessing && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Auto-refreshing status...
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-850 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400">No documents ingested yet. Upload your first PDF above or run the demo seed script.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-slate-800 transition-colors">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate tracking-tight" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                      <span>{new Date(doc.upload_time).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{doc.page_count || 0} pages</span>
                      <span>•</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                        {doc.fact_count || 0} facts
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={doc.status} />
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
