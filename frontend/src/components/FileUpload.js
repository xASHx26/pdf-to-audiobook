import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert('Please upload a valid PDF file');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Upload Your PDF Document
        </h2>
        <p className="text-gray-600">
          Convert any PDF into an engaging audiobook with AI-powered summarization
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`upload-area border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : isProcessing
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="loading-spinner"></div>
          ) : (
            <Upload className={`w-16 h-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isProcessing
                ? 'Processing your document...'
                : isDragActive
                ? 'Drop your PDF here'
                : 'Drag & drop your PDF here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF files up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
          <FileText className="w-6 h-6 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Smart Analysis</h4>
            <p className="text-sm text-green-600">AI detects document type</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
          <Upload className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">Easy Upload</h4>
            <p className="text-sm text-blue-600">Drag, drop, or click</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-purple-600" />
          <div>
            <h4 className="font-medium text-purple-800">Secure</h4>
            <p className="text-sm text-purple-600">Files processed locally</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
