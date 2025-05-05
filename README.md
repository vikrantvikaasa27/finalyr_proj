# INTERVIEWPREP: AI-POWERED RESUME ANALYSIS AND MOCK INTERVIEW SYSTEM FOR JOB SEEKERS

A comprehensive web application for resume analysis and mock interviews using AI. 

## Abstract

InterviewPrep AI is an AI-powered web platform designed to help job seekers optimize their resumes and improve interview performance. It offers resume analysis, where Generative AI evaluates structure, keywords, and skill alignment, providing personalized feedback to enhance job applications. Additionally, its mock interview simulation generates tailored questions based on job descriptions and analyzes responses using sentiment analysis and confidence scoring to offer real-time insights. The platform also tracks user progress, allowing candidates to refine their skills over time. By leveraging machine learning and NLP, InterviewPrep AI ensures a data-driven, interactive, and efficient job preparation experience, helping users gain confidence and stand out in competitive hiring processes.

![WhatsApp Image 2025-05-05 at 10 24 21_c2db5454](https://github.com/user-attachments/assets/d0573ce7-be16-41ef-be0c-2ef9e71a77c4)

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

## Output
![Screenshot 2025-04-07 101330](https://github.com/user-attachments/assets/58cbbcc1-3b25-4788-a5d4-b183990b0135)

![Screenshot 2025-04-07 101421](https://github.com/user-attachments/assets/3d6df60a-0687-4824-bd4f-0531763ad2e6)

![image](https://github.com/user-attachments/assets/7cb85802-82a6-4375-acdf-d17d2680fd09)

![image](https://github.com/user-attachments/assets/f4c0224f-71ca-4876-954e-12a53ca5ae1a)

![image](https://github.com/user-attachments/assets/1414e7ed-0117-48bf-83e6-75d842d3c845)

![image](https://github.com/user-attachments/assets/f0b278f8-dc1b-4a0d-a755-d92a063e1a28)


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

## Contributions

- [Vijaya Dharshini Sivakumar](https://github.com/VijayaDharshiniSivakumar)
- [Shobika K](https://github.com/Shobika-k2004)
- [Sairam K](https://github.com/Sairam-K26)
