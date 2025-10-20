import React from 'react';
import { Heart, Github, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">PDF to Audio Converter</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Transform your PDF documents into engaging audiobooks using advanced AI technology. 
              Perfect for learning on the go, accessibility, or simply enjoying content in a new way.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✨ AI-powered summarization</li>
              <li>🎧 High-quality text-to-speech</li>
              <li>📄 Research paper detection</li>
              <li>⚡ Fast processing</li>
              <li>🔒 Secure and private</li>
              <li>📱 Mobile-friendly interface</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Built With</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>🤖 <strong>Backend:</strong> FastAPI + Google Gemini AI</p>
              <p>⚛️ <strong>Frontend:</strong> React + Tailwind CSS</p>
              <p>🎵 <strong>Audio:</strong> Google Text-to-Speech</p>
              <p>📊 <strong>Analysis:</strong> Advanced NLP</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by AI enthusiasts</span>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              <Github className="w-4 h-4" />
              <span>View Source</span>
            </button>
            
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-yellow-600 transition-colors">
              <Coffee className="w-4 h-4" />
              <span>Buy me a coffee</span>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your files are processed securely and are not stored on our servers. 
            This tool is for educational and personal use. Please respect copyright laws.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
