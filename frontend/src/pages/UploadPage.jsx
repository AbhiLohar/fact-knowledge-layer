import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, Trash2, AlertCircle } from 'lucide-react';
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
        const hasProcessing = currentDocs.some(d => d.status === 'processing' || d.status === 'pending');
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
      setError('Please upload a valid PDF file.');
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
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(d => d.id !== id));
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
        <p className="text-gray-500">Upload PDF documents to extract facts and relationships.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'
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
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Drop PDF here or click to upload'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Only PDF files are supported</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No documents uploaded yet.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <File className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.filename}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(doc.upload_time).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {doc.fact_count || 0} facts
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StatusBadge status={doc.status} />
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
