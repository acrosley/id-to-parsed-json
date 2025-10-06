'use client';

import { useState } from 'react';

interface ParsedLicense {
  id: number;
  data: {
    jurisdiction: string;
    idNumber: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    dob: string;
    issuedOn?: string;
    expiresOn?: string;
    class?: string;
    restrictions?: string;
    endorsements?: string;
    sex?: string;
    eyeColor?: string;
    height?: string;
    rawSource: string;
    rawText?: string;
    confidence: number;
  };
}

interface LicenseResultProps {
  result: ParsedLicense;
  onUploadAnother: () => void;
}

export default function LicenseResult({ result, onUploadAnother }: LicenseResultProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'raw'>('overview');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'raw', label: 'Raw Data', icon: '🔍' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">License Parsed Successfully!</h3>
              <p className="text-sm text-green-600">Record ID: {result.id} | Source: {result.data.rawSource}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.data.confidence)}`}>
              {(result.data.confidence * 100).toFixed(1)}% Confidence
            </span>
            <button
              onClick={onUploadAnother}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Personal Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.data.firstName} {result.data.middleName && `${result.data.middleName} `}{result.data.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">License Number</label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded border">{result.data.idNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-lg">{formatDate(result.data.dob)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <div className="text-lg">
                    <p>{result.data.address1}</p>
                    {result.data.address2 && <p>{result.data.address2}</p>}
                    <p>{result.data.city}, {result.data.state} {result.data.postalCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">License Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">License Class</label>
                  <p className="text-lg">{result.data.class || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Issue Date</label>
                  <p className="text-lg">{formatDate(result.data.issuedOn)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Expiration Date</label>
                  <p className="text-lg">{formatDate(result.data.expiresOn)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Jurisdiction</label>
                  <p className="text-lg">{result.data.jurisdiction}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Physical Characteristics */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Physical Characteristics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sex</label>
                  <p className="text-lg">{result.data.sex || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Eye Color</label>
                  <p className="text-lg">{result.data.eyeColor || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Height</label>
                  <p className="text-lg">{result.data.height || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* License Restrictions */}
            {(result.data.restrictions || result.data.endorsements) && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">License Restrictions & Endorsements</h4>
                <div className="space-y-3">
                  {result.data.restrictions && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Restrictions</label>
                      <p className="text-lg">{result.data.restrictions}</p>
                    </div>
                  )}
                  {result.data.endorsements && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Endorsements</label>
                      <p className="text-lg">{result.data.endorsements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Source</label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded">{result.data.rawSource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Confidence Score</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          result.data.confidence >= 0.9 ? 'bg-green-500' :
                          result.data.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.data.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {(result.data.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Raw Barcode Data</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{result.data.rawText || 'No raw data available'}</pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Parsed JSON Data</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
