import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingSteps from './components/ProcessingSteps';
import AudioPlayer from './components/AudioPlayer';
import Header from './components/Header';
import Footer from './components/Footer';
import StatusMessage from './components/StatusMessage';
import TokenCounter from './components/TokenCounter';
import { FileText, Download, ChevronDown, ChevronUp, Headphones, Play, Zap } from 'lucide-react';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenRefresh, setTokenRefresh] = useState(0);

  const steps = [
    { id: 1, title: 'Upload PDF', icon: FileText, description: 'Select your PDF document' },
    { id: 2, title: 'Analyze Document', icon: FileText, description: 'AI analyzes your document' },
    { id: 3, title: 'Create Summary', icon: FileText, description: 'Generate audiobook summary' },
    { id: 4, title: 'Generate Audio', icon: Headphones, description: 'Convert to speech' },
    { id: 5, title: 'Download & Play', icon: Play, description: 'Enjoy your audiobook' }
  ];

  const showStatus = useCallback((message, type = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  }, []);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setCurrentStep(1);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/uploadfile/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadedFile(file);
        showStatus(result.message, 'success');
        setCurrentStep(2);
        await handleAnalyzeDocument();
      } else {
        showStatus(result.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error uploading file: ' + error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    try {
      // First get PDF info
      const pdfResponse = await fetch('http://127.0.0.1:8000/read_pdf/');
      const pdfResult = await pdfResponse.json();
      
      if (pdfResponse.ok) {
        setPdfInfo(pdfResult);
      }

      // Then analyze document type
      const analysisResponse = await fetch('http://127.0.0.1:8000/analyze_pdf/');
      const analysisResult = await analysisResponse.json();
      
      if (analysisResponse.ok) {
        setAnalysisData(analysisResult);
        setCurrentStep(3);
        setTokenRefresh(prev => prev + 1); // Refresh token counter
        // Only proceed to summarize if it's a research paper
        if (analysisResult.is_research_paper) {
          showStatus('Research paper detected! Creating summary...', 'success');
          await handleSummarizeDocument();
        } else {
          showStatus('Document analyzed! Not a research paper.', 'info');
          setIsProcessing(false);
        }
      } else {
        showStatus(analysisResult.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error analyzing document: ' + error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleSummarizeDocument = async () => {
    try {
      const summaryResponse = await fetch('http://127.0.0.1:8000/summarize_pdf/');
      const summaryResult = await summaryResponse.json();
      
      if (summaryResponse.ok) {
        setSummaryData(summaryResult);
        showStatus('Summary created successfully!', 'success');
        setCurrentStep(4);
        setTokenRefresh(prev => prev + 1); // Refresh token counter
        await handleGenerateAudio();
      } else {
        showStatus(summaryResult.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error creating summary: ' + error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/generate_audio_book/');
      const result = await response.json();
      
      if (response.ok) {
        showStatus(result.message, 'success');
        setAudioUrl('http://127.0.0.1:8000/play_audio_book/');
        setCurrentStep(5);
        setIsProcessing(false);
      } else {
        showStatus(result.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error generating audio: ' + error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/download_audio_book/');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `audiobook_${uploadedFile?.name?.replace('.pdf', '') || 'book'}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showStatus('Audio book downloaded successfully!', 'success');
      } else {
        const result = await response.json();
        showStatus(result.message, 'error');
      }
    } catch (error) {
      showStatus('Error downloading audio: ' + error.message, 'error');
    }
  };

  const resetApp = () => {
    setUploadedFile(null);
    setCurrentStep(0);
    setIsProcessing(false);
    setAudioUrl(null);
    setStatusMessage(null);
    setPdfInfo(null);
    setSummaryData(null);
    setAnalysisData(null);
    setIsExpanded(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Token Counter */}
      <TokenCounter refreshTrigger={tokenRefresh} />
      
      <main className="container mx-auto px-4 py-8">
        {statusMessage && (
          <StatusMessage 
            message={statusMessage.message} 
            type={statusMessage.type} 
          />
        )}

        <div className="max-w-7xl mx-auto">
          {/* Progress Steps */}
          <ProcessingSteps 
            steps={steps} 
            currentStep={currentStep} 
            isProcessing={isProcessing}
            showProgressBar={!analysisData || analysisData.is_research_paper}
          />

          {/* Main Content */}
          <div className="mt-8">
            {currentStep === 0 && (
              <FileUpload 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />
            )}

            {currentStep > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  {uploadedFile && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📄 Uploaded Document
                      </h3>
                      <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pdfInfo && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📊 Document Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">File Size:</span>
                          <span className="ml-2 text-gray-800">{pdfInfo.file_size_mb} MB</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Total PDFs:</span>
                          <span className="ml-2 text-gray-800">{pdfInfo.total_pdf_files}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisData && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          📋 Document Analysis
                        </h3>
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold">
                          {analysisData.is_research_paper ? (
                            <span className="text-green-600 bg-green-100 px-4 py-2 rounded-full">
                              ✓ This is a Research Paper
                            </span>
                          ) : (
                            <span className="text-orange-600 bg-orange-100 px-4 py-2 rounded-full">
                              ℹ️ This is NOT a Research Paper
                            </span>
                          )}
                        </div>
                      </div>

                      {!analysisData.is_research_paper && (
                        <div className="text-center mb-6">
                          <p className="text-gray-600 mb-4">
                            Since this is not a research paper, you can manually proceed to summarization.
                          </p>
                          <button
                            onClick={handleSummarizeDocument}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                          >
                            {isProcessing ? 'Processing...' : 'Create Summary & Audio'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {summaryData && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          📝 Document Summary
                        </h3>
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Expand
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Word Count:</span>
                            <span className="ml-2 text-gray-800">{summaryData.summary_details?.word_count}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Document Type:</span>
                            <span className="ml-2 text-gray-800">
                              {summaryData.is_research_paper ? 'Research Paper' : 'General Document'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Status:</span>
                            <span className="ml-2 text-green-600 font-medium">Processed</span>
                          </div>
                        </div>
                        
                        <div className={`bg-gray-50 rounded-lg p-4 transition-all duration-300 ${
                          isExpanded ? 'max-h-none' : 'max-h-64'
                        } overflow-y-auto`}>
                          <h4 className="font-medium text-gray-700 mb-2">
                            {isExpanded ? 'Full Summary:' : 'Summary Preview:'}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {isExpanded 
                              ? summaryData.summary
                              : summaryData.summary?.substring(0, 500) + (summaryData.summary?.length > 500 ? '...' : '')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="loading-spinner"></div>
                        <span className="text-gray-600">
                          {currentStep === 1 && 'Uploading and analyzing your PDF...'}
                          {currentStep === 2 && 'Creating AI-powered summary...'}
                          {currentStep === 3 && 'Generating audio book...'}
                        </span>
                      </div>
                      
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="progress-bar h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(currentStep / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Audio Player (1/3 width) */}
                <div className="lg:col-span-1">
                  {audioUrl && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in sticky top-20">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        🎧 Your Audio Book
                      </h3>
                      <AudioPlayer audioUrl={audioUrl} />
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={handleDownload}
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                        
                        <button
                          onClick={resetApp}
                          className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                        >
                          🔄 Convert Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
