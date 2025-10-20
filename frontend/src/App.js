import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingSteps from './components/ProcessingSteps';
import AudioPlayer from './components/AudioPlayer';
import Header from './components/Header';
import Footer from './components/Footer';
import StatusMessage from './components/StatusMessage';
import { FileText, Headphones, Download, Play } from 'lucide-react';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const steps = [
    { id: 1, title: 'Upload PDF', icon: FileText, description: 'Select your PDF document' },
    { id: 2, title: 'Analyze & Summarize', icon: FileText, description: 'AI processes your document' },
    { id: 3, title: 'Generate Audio', icon: Headphones, description: 'Convert to speech' },
    { id: 4, title: 'Download & Play', icon: Play, description: 'Enjoy your audiobook' }
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
        await handleAnalyzeAndSummarize();
      } else {
        showStatus(result.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error uploading file: ' + error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleAnalyzeAndSummarize = async () => {
    try {
      // First get PDF info
      const pdfResponse = await fetch('http://127.0.0.1:8000/read_pdf/');
      const pdfResult = await pdfResponse.json();
      
      if (pdfResponse.ok) {
        setPdfInfo(pdfResult);
      }

      // Then summarize
      const summaryResponse = await fetch('http://127.0.0.1:8000/summarize_pdf/');
      const summaryResult = await summaryResponse.json();
      
      if (summaryResponse.ok) {
        setSummaryData(summaryResult);
        showStatus('Document analyzed and summarized successfully!', 'success');
        setCurrentStep(3);
        await handleGenerateAudio();
      } else {
        showStatus(summaryResult.message, 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      showStatus('Error analyzing document: ' + error.message, 'error');
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
        setCurrentStep(4);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {statusMessage && (
          <StatusMessage 
            message={statusMessage.message} 
            type={statusMessage.type} 
          />
        )}

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <ProcessingSteps 
            steps={steps} 
            currentStep={currentStep} 
            isProcessing={isProcessing}
          />

          {/* Main Content */}
          <div className="mt-8 space-y-6">
            {currentStep === 0 && (
              <FileUpload 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />
            )}

            {currentStep > 0 && uploadedFile && (
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

            {summaryData && (
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📝 Document Summary
                </h3>
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
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="font-medium text-gray-700 mb-2">Summary Preview:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {summaryData.summary?.substring(0, 500)}
                      {summaryData.summary?.length > 500 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {audioUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🎧 Your Audio Book
                </h3>
                <AudioPlayer audioUrl={audioUrl} />
                
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Audio Book
                  </button>
                  
                  <button
                    onClick={resetApp}
                    className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    🔄 Convert Another PDF
                  </button>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
