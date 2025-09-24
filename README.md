# Pronunciation Coach

A modern web application that helps users practice and improve their English pronunciation using AI-powered feedback and real-time speech analysis.

![Pronunciation Coach Welcome Screen](https://github.com/user-attachments/assets/0c3b3c60-daf6-4f00-b5c7-dce3caced035)

## Features

- **🎯 AI-Powered Feedback**: Get instant pronunciation analysis and personalized improvement tips
- **🎤 Real-time Recording**: Practice with live microphone recording and speech recognition
- **📊 Performance Scoring**: Receive detailed scores and letter grades for your pronunciation
- **⏱️ Timed Practice Sessions**: 30-second reading sessions with automatic timing
- **📈 Progress Tracking**: Monitor your improvement over time with session statistics
- **🔄 Dynamic Text Generation**: Practice with a variety of texts at different difficulty levels

## How It Works

![Practice Session](https://github.com/user-attachments/assets/ab137e85-b747-4089-87a2-54862a74263d)

1. **Click "Start Practice"** to begin a new pronunciation session
2. **Read the displayed text** clearly into your microphone within 30 seconds
3. **Get instant feedback** including transcription, score, and improvement tips
4. **Track your progress** with detailed analytics and performance history

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Speech Recognition**: Web Speech API for browser-based transcription
- **Audio Recording**: MediaRecorder API for capturing pronunciation
- **Architecture**: Agent-based system with modular components:
  - `PronCoachAgent`: Main orchestrator
  - `TranscriptionAgent`: Speech-to-text processing
  - `ComparisonAgent`: Pronunciation analysis and scoring
  - `FeedbackAgent`: Personalized feedback generation
  - `PracticeAgent`: Session management and progress tracking

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern browser with microphone support
- HTTPS connection (required for microphone access)

### Installation

```bash
# Clone the repository
git clone https://github.com/jesskuo4/pronunciation.git
cd pronunciation

# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Deployment

This app is configured for deployment on GitHub Pages:

```bash
# Deploy to GitHub Pages
npm run deploy
```

The app will be available at: `https://jesskuo4.github.io/pronunciation/`

## Browser Support

- **Microphone Access**: Requires HTTPS and user permission
- **Speech Recognition**: Chrome, Edge, Safari (with webkit prefix)
- **Audio Recording**: Modern browsers with MediaRecorder API support

## Usage Tips

1. **Use a quiet environment** for best speech recognition results
2. **Speak clearly and at moderate pace** for accurate analysis
3. **Allow microphone permissions** when prompted
4. **Use headphones** to prevent audio feedback during recording
5. **Practice regularly** to see improvement in your pronunciation scores

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Copilot Development Log

This project was developed with GitHub Copilot assistance:
- Agent-based architecture design and implementation
- React component structure with TypeScript
- Speech recognition integration and audio processing
- UI/UX design with responsive CSS styling
- Real-time feedback system and scoring algorithms