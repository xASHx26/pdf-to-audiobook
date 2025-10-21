# PDF to Audio Converter 🎧

A modern web application that converts PDF documents into engaging audiobooks using AI-powered summarization and text-to-speech technology.

![PDF to Audio Converter](https://img.shields.io/badge/AI-Powered-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)

## ✨ Features

### 🤖 AI-Powered Processing
- **Smart Document Analysis**: Automatically detects research papers vs general documents
- **Intelligent Summarization**: Uses Google Gemini AI for contextual, audiobook-optimized summaries
- **Research Paper Support**: Specialized handling for academic papers with methodology, findings, and conclusions

### 🎧 Audio Generation
- **High-Quality TTS**: Google Text-to-Speech for natural-sounding audio
- **Custom Audio Player**: Built-in player with seek, volume, and skip controls
- **Multiple Formats**: Download as MP3 for offline listening

### 🎨 Modern Interface
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-Time Progress**: Step-by-step visual feedback during processing
- **Drag & Drop Upload**: Intuitive file upload with validation
- **Toast Notifications**: User-friendly feedback and error handling

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- Google Gemini API Key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/xASHx26/pdf-to-audiobook.git
   cd pdf-to-audiobook
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn google-generativeai gtts python-multipart
   ```

4. **Configure API Key**
   ```bash
   # Copy the template
   copy .env.example .GITIGNORE
   
   # Edit .GITIGNORE and add your Google Gemini API key
   api_key="your_actual_api_key_here"
   ```

5. **Run the backend**
   ```bash
   python main.py
   ```
   Backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   # Option 1: Use the setup script (Windows)
   .\setup-frontend.bat
   
   # Option 2: Manual setup
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

## 📋 Usage

1. **Upload PDF**: Drag & drop or click to upload your PDF document
2. **AI Analysis**: The system analyzes and summarizes your document
3. **Audio Generation**: Converts the summary into high-quality speech
4. **Listen & Download**: Play in browser or download the MP3 file

## 🛠️ API Endpoints

### Core Endpoints
- `POST /uploadfile/` - Upload PDF documents
- `GET /read_pdf/` - Get information about uploaded PDFs
- `GET /analyze_pdf/` - Analyze document type (research paper detection)
- `GET /summarize_pdf/` - Generate AI-powered summaries
- `GET /generate_audio_book/` - Convert summary to audio
- `GET /download_audio_book/` - Download generated audio
- `GET /play_audio_book/` - Stream audio in browser

### API Documentation
Visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## 🏗️ Project Structure

```
pdf-to-audiobook/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── .GITIGNORE          # API key configuration (not in Git)
│   ├── .env.example        # API key template
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main application
│   │   └── index.css      # Styles
│   ├── public/
│   └── package.json       # Node dependencies
├── audio/                 # Generated audio files (gitignored)
├── pdf/                   # Uploaded PDFs (gitignored)
└── README.md
```

## 🔧 Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Google Gemini AI**: Advanced language model for summarization
- **Google Text-to-Speech**: High-quality speech synthesis
- **Uvicorn**: ASGI server for production

### Frontend 
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **React Dropzone**: Drag & drop file upload
- **Axios**: HTTP client for API communication

## ⚙️ Configuration

### Environment Variables

Create a `.GITIGNORE` file in the root directory:
```
api_key="your_google_gemini_api_key"
```

### Getting Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.GITIGNORE` file
4. Keep this file local (never commit to Git)

## 🔒 Security Notes

- API keys are stored in `.GITIGNORE` file (excluded from Git)
- Files are processed locally and not stored permanently
- CORS is configured for local development
- All file uploads are validated for PDF format

## 🚀 Production Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ directory to your static hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- React community for excellent development tools
- Tailwind CSS for beautiful, responsive design
- FastAPI for the intuitive Python web framework

## 📧 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ by AI enthusiasts for the community**
