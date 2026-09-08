import React, { useState, useEffect } from 'react';
import { getShowcase } from '../api';
import FactCard from '../components/FactCard';
import EmptyState from '../components/EmptyState';
import { Award, AlertTriangle, Loader2 } from 'lucide-react';
import { formatConfidence } from '../utils';

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
        setError('Could not load showcase data. Please ensure you have uploaded the required test documents.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowcase();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="pt-12 max-w-2xl mx-auto">
        <EmptyState 
          icon={AlertTriangle} 
          title="Showcase Data Unavailable" 
          description={error || "Showcase data not found."} 
        />
      </div>
    );
  }

  const sections = [
    {
      id: 'corroboration',
      title: '1. Corroboration',
      description: 'A fact corroborated across multiple documents.',
      color: 'border-green-500',
      data: showcase.corroboration
    },
    {
      id: 'contradiction',
      title: '2. Contradiction',
      description: 'A genuine contradiction between documents.',
      color: 'border-red-500',
      data: showcase.contradiction
    },
    {
      id: 'reconcilable',
      title: '3. Reconcilable Difference',
      description: 'A contradiction explained by context (e.g., time/scope).',
      color: 'border-amber-500',
      data: showcase.reconcilable
    }
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      <div className="text-center bg-indigo-900 text-white p-12 rounded-2xl shadow-lg">
        <Award className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
        <h1 className="text-3xl font-bold mb-4">Four Required Cases Showcase</h1>
        <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
          This page highlights the system's ability to extract, compare, and reason about complex facts across multiple documents.
        </p>
      </div>

      <div className="space-y-12">
        {sections.map((section) => (
          section.data && (
            <section key={section.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden`}>
              <div className={`p-6 border-l-4 ${section.color} bg-gray-50 border-b border-gray-200 flex justify-between items-center`}>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-gray-600 mt-1">{section.description}</p>
                </div>
                {section.data?.confidence && (
                  <span className="text-xs font-semibold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
                    Confidence: {formatConfidence(section.data.confidence)}
                  </span>
                )}
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fact A</h3>
                    <FactCard fact={section.data.fact_a} expandable={true} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fact B</h3>
                    <FactCard fact={section.data.fact_b} expandable={true} />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">System Reasoning</h3>
                  <p className="text-blue-800">{section.data.reasoning}</p>
                </div>
              </div>
            </section>
          )
        ))}

        {/* 4. Extraction Failure Section */}
        {showcase.extraction_failure && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-l-4 border-gray-500 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">4. Extraction Failure Handling</h2>
              <p className="text-gray-600 mt-1">Demonstration of how the system handles difficult or ambiguous extractions.</p>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 p-5 rounded-lg border border-gray-200 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Failure Description</h3>
                <p className="text-gray-700">{showcase.extraction_failure.description}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                  <h3 className="font-semibold text-red-800 mb-2">What Went Wrong</h3>
                  <p className="text-red-700 text-sm">{showcase.extraction_failure.what_went_wrong}</p>
                </div>
                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-2">Suggested Improvement</h3>
                  <p className="text-green-700 text-sm">{showcase.extraction_failure.improvement}</p>
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
