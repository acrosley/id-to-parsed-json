'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import LicenseResult from './LicenseResult';

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

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: ParsedLicense | null;
}

export default function LicenseUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    await handleFileUpload(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: uploadState.isUploading
  });

  const handleFileUpload = async (file: File) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPEG, PNG, etc.)');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      const response = await fetch('/api/parse-license', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result: result,
      });

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null,
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Driver's License Parser
        </h1>
        <p className="text-gray-600">
          Upload an image of a driver's license to extract structured data from the PDF417 barcode
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div
          {...getRootProps()}
          className={`cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadState.isUploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} ref={fileInputRef} onChange={handleFileSelect} />
          
          <div className="text-center">
            {uploadState.isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Processing...</p>
                  <p className="text-sm text-gray-500">Decoding PDF417 barcode</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{uploadState.progress}%</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop the image here' : 'Upload License Image'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop an image, or click to select
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Supports: JPEG, PNG, GIF, BMP, WebP (max 10MB)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <p className="text-sm text-red-700 mt-1">{uploadState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {uploadState.result && (
        <LicenseResult 
          result={uploadState.result} 
          onUploadAnother={resetUpload} 
        />
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Take a clear photo of the back of a driver's license</li>
          <li>Ensure the PDF417 barcode is visible and not blurry</li>
          <li>Upload the image using the drag-and-drop area above</li>
          <li>The system will extract structured data from the barcode</li>
          <li>Review the parsed information displayed below</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This tool works with US driver's licenses that use the AAMVA standard. 
            The PDF417 barcode must be clearly visible for successful parsing.
          </p>
        </div>
      </div>
    </div>
  );
}
