# Resume Analyzer and Mock Interview Application

A comprehensive web application for resume analysis and mock interviews using AI.

## Features

- **Resume Analysis**: Upload your resume and get detailed feedback on how to improve it for ATS systems
- **Mock Interviews**: Practice interviews with AI-generated questions based on your resume and job descriptions
- **Voice Recording**: Record your answers to interview questions and get AI-powered feedback
- **Progress Tracking**: Track your improvement over time with the dashboard

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- ffmpeg (required for audio processing)

### Installing ffmpeg

#### Windows
1. Download ffmpeg from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract the downloaded zip file
3. Add the bin folder to your system PATH
4. Verify installation by running `ffmpeg -version` in a command prompt

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Backend Setup

1. Navigate to the project root directory
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create a `.env` file in the project root with your API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```
6. Start the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd resume-analyzer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register or log in to your account
3. Upload your resume and get feedback
4. Start a mock interview by uploading your resume and a job description
5. Record your answers to interview questions
6. View your progress in the dashboard

## Troubleshooting

### Audio Recording Issues

If you encounter issues with audio recording or transcription:

1. Make sure ffmpeg is properly installed and accessible in your PATH
2. Check that your microphone is working and properly connected
3. Ensure you've granted microphone permissions to the browser
4. Try using a different browser (Chrome is recommended)

### API Key Issues

If you encounter issues with the Google Gemini API:

1. Make sure your API key is correctly set in the `.env` file
2. Verify that the API key has access to the Gemini model
3. Check your API usage limits

## License

MIT 