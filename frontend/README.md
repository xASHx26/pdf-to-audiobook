# PDF to Audio Converter - React Frontend

A modern, responsive React frontend for the PDF to Audio Converter application.

## Features

🎨 **Modern UI/UX**
- Clean, intuitive design with Tailwind CSS
- Responsive layout for all devices
- Smooth animations and transitions
- Real-time progress tracking

🚀 **Interactive Components**
- Drag & drop file upload
- Custom audio player with controls
- Step-by-step process visualization
- Toast notifications for feedback

⚡ **Performance**
- Fast rendering with React 18
- Optimized bundle size
- Lazy loading components
- Efficient state management

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- FastAPI backend running on http://127.0.0.1:8000

### Environment Configuration

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_VERSION=1.0.0
```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── AudioPlayer.js  # Custom audio player
│   │   ├── FileUpload.js   # Drag & drop upload
│   │   ├── Header.js       # App header
│   │   ├── Footer.js       # App footer
│   │   ├── ProcessingSteps.js # Progress visualization
│   │   └── StatusMessage.js   # Toast notifications
│   ├── App.js             # Main app component
│   ├── index.js           # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Component Overview

### `App.js`
Main application component that manages state and orchestrates the PDF to audio conversion workflow.

### `FileUpload.js` 
Drag & drop file upload component with validation and visual feedback.

### `ProcessingSteps.js`
Visual progress indicator showing the 4-step conversion process.

### `AudioPlayer.js`
Custom audio player with controls for play, pause, seek, and volume.

### `StatusMessage.js`
Toast notification component for user feedback.

### `Header.js` & `Footer.js`
Layout components with branding and information.

## API Integration

The frontend connects to the FastAPI backend with these endpoints:

- `POST /uploadfile/` - Upload PDF file
- `GET /read_pdf/` - Get PDF information  
- `GET /summarize_pdf/` - Get AI summary
- `GET /generate_audio_book/` - Generate audio
- `GET /play_audio_book/` - Stream audio
- `GET /download_audio_book/` - Download audio

## Styling

Uses Tailwind CSS for styling with custom animations and components:

- **Colors**: Blue/purple gradient theme
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and loading states
- **Responsive**: Mobile-first design approach

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**CORS errors:**
- Ensure FastAPI backend has CORS middleware configured
- Check API URL in environment variables

**Audio not playing:**
- Verify backend is generating audio files
- Check browser audio permissions
- Ensure HTTPS for production (required for audio autoplay)

**Upload failures:**
- Check file size limits (50MB max)
- Verify PDF file format
- Ensure backend /uploadfile/ endpoint is working

## License

MIT License - see LICENSE file for details.
