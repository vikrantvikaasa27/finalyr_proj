import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MockInterview.css';
import { FaFileUpload, FaMicrophone, FaStop, FaArrowRight, FaCheck, FaTimes, FaSpinner, FaChartBar, FaHome } from 'react-icons/fa';

const MockInterview = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    resume: null,
    jobDescription: ''
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [interviewResults, setInterviewResults] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, resume: file });
      setError('');
    } else if (file) {
      setError('Please upload a PDF file for your resume');
    }
  };

  const handleJobDescriptionChange = (e) => {
    setFormData({ ...formData, jobDescription: e.target.value });
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setFormData({ ...formData, resume: file });
        setError('');
      } else {
        setError('Please upload a PDF file for your resume');
      }
    }
  };

  const handleStartInterview = async () => {
    if (!formData.resume || !formData.jobDescription) {
      setError('Please upload a resume and provide a job description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('resume', formData.resume);
      formDataToSend.append('job_description', formData.jobDescription);

      const response = await fetch('http://localhost:5000/api/start-interview', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format from server');
      }
      
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setInterviewResults([]);
    } catch (err) {
      setError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup timer when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'  // Specify the audio format
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Reset and start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Set timeslice to ensure we get data chunks during recording
      mediaRecorder.start(200); // Collect data every 200ms
      setIsRecording(true);
      setHasRecorded(false);
      setError('');
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          try {
            if (audioChunksRef.current.length === 0) {
              throw new Error('No audio data recorded');
            }

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Verify blob size
            if (audioBlob.size === 0) {
              throw new Error('Audio recording is empty');
            }

            setIsLoading(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('question', questions[currentQuestionIndex]);
            formData.append('question_index', currentQuestionIndex.toString());

            const response = await fetch('http://localhost:5000/api/submit-answer', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to submit answer');
            }

            const data = await response.json();
            setInterviewResults(prev => [...prev, {
              question: questions[currentQuestionIndex],
              answer: data.transcribed_text,
              analysis: data.analysis
            }]);

            setHasRecorded(true);
            setError('');
            resolve();
          } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit answer. Please try again.');
            setHasRecorded(false);
            resolve();
          } finally {
            setIsLoading(false);
          }
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        
        // Stop all audio tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setHasRecorded(false);
      setRecordingTime(0);
    } else {
      // Interview completed - generate final report
      const scores = interviewResults.map(result => ({
        confidence: result.analysis.confidence || 0,
        clarity: result.analysis.clarity || 0,
        relevance: result.analysis.relevance || 0
      }));

      // Calculate average score out of 10
      const overallScore = Math.min(10, Math.round(
        scores.reduce((acc, score) => 
          acc + (score.confidence + score.clarity + score.relevance) / 3, 0) / scores.length
      ));

      const finalFeedback = {
        date: new Date().toISOString(),
        score: overallScore,
        totalQuestions: questions.length,
        results: interviewResults.map(result => ({
          question: result.question,
          answer: result.answer,
          feedback: result.analysis.feedback,
          suggestions: result.analysis.suggestions
        })),
        overallFeedback: {
          score: overallScore,
          improvements: Array.from(new Set(
            interviewResults.flatMap(result => result.analysis.suggestions)
          )).slice(0, 5),
          strengths: interviewResults
            .filter(result => (result.analysis.clarity + result.analysis.confidence + result.analysis.relevance) / 3 >= 7)
            .map(result => result.analysis.feedback)
        }
      };

      // Save interview results to localStorage for dashboard
      const savedInterviews = JSON.parse(localStorage.getItem('interviewResults') || '[]');
      localStorage.setItem('interviewResults', JSON.stringify([...savedInterviews, finalFeedback]));

      setFeedback(finalFeedback);
    }
  };

  if (feedback) {
    return (
      <div className="mock-interview">
        <div className="feedback-container animate-fade-in">
          <div className="feedback-header">
            <h2>Interview Complete! <FaCheck className="success-icon" /></h2>
            <div className="score-badge">
              <div className="score-circle">
                <span className="score-value">{feedback.score}</span>
                <span className="score-max">/10</span>
              </div>
              <span>Overall Score</span>
            </div>
          </div>

          <div className="feedback-content">
            <div className="feedback-section">
              <h3><span className="highlight">Key Strengths</span></h3>
              {feedback.overallFeedback.strengths && feedback.overallFeedback.strengths.length > 0 ? (
                <ul className="strengths-list">
                  {feedback.overallFeedback.strengths.map((strength, index) => (
                    <li key={index} className="strength-item"><FaCheck className="icon-success" /> {strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No specific strengths identified. Continue practicing to improve!</p>
              )}
            </div>

            <div className="feedback-section">
              <h3><span className="highlight">Areas for Improvement</span></h3>
              {feedback.overallFeedback.improvements && feedback.overallFeedback.improvements.length > 0 ? (
                <ul className="improvements-list">
                  {feedback.overallFeedback.improvements.map((improvement, index) => (
                    <li key={index} className="improvement-item">{improvement}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No specific improvements identified.</p>
              )}
            </div>
          </div>

          <div className="feedback-actions">
            <button 
              className="dashboard-button"
              onClick={() => navigate('/dashboard')}
            >
              <FaChartBar /> View in Dashboard
            </button>
            <button 
              className="restart-button"
              onClick={() => {
                setQuestions([]);
                setFeedback(null);
                setFormData({ resume: null, jobDescription: '' });
              }}
            >
              <FaHome /> Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-interview">
      {!questions.length ? (
        <div className="interview-setup animate-fade-in">
          <h2>Mock Interview Setup</h2>
          <p className="setup-description">
            Upload your resume and enter a job description to generate personalized interview questions
          </p>
          
          <div className="setup-form" onDragEnter={handleDrag}>
            <div 
              className={`upload-section${dragActive ? ' drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label htmlFor="resume-upload" className="file-label">
                <FaFileUpload className="upload-icon" />
                <span>{formData.resume ? formData.resume.name : 'Drag & drop or click to upload resume (PDF)'}</span>
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-upload"
              />
            </div>
            
            <div className="job-description-section">
              <label htmlFor="job-description">Job Description</label>
              <textarea
                id="job-description"
                value={formData.jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste the job description here to generate relevant interview questions..."
                rows="5"
              />
            </div>
            
            {error && <div className="error-message"><FaTimes className="error-icon" /> {error}</div>}
            
            <button
              className="start-button"
              onClick={handleStartInterview}
              disabled={isLoading}
            >
              {isLoading ? <><FaSpinner className="spinner" /> Preparing Questions...</> : 'Start Interview'}
            </button>
          </div>
        </div>
      ) : (
        <div className="interview-session animate-fade-in">
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">Question {currentQuestionIndex + 1} of {questions.length}</div>
            </div>
          </div>
          
          <div className="question-section">
            <h3>Question:</h3>
            <p className="question-text">{questions[currentQuestionIndex]}</p>
          </div>
          
          <div className="recording-section">
            {!isRecording ? (
              <button
                className={`record-button ${hasRecorded ? 'recorded' : ''}`}
                onClick={startRecording}
                disabled={hasRecorded || isLoading}
              >
                {hasRecorded ? (
                  <>
                    <FaCheck /> Answer Recorded
                  </>
                ) : (
                  <>
                    <FaMicrophone /> Start Recording
                  </>
                )}
              </button>
            ) : (
              <div className="recording-controls">
                <div className="recording-indicator">
                  <div className="recording-pulse"></div>
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                </div>
                <button
                  className="stop-button"
                  onClick={stopRecording}
                  disabled={isLoading}
                >
                  {isLoading ? <FaSpinner className="spinner" /> : <FaStop />} Stop Recording
                </button>
              </div>
            )}
          </div>
          
          {isLoading && !isRecording && (
            <div className="loading-indicator">
              <FaSpinner className="spinner" />
              <span>Processing your answer...</span>
            </div>
          )}
          
          {hasRecorded && !isLoading && (
            <div className="answer-feedback">
              <div className="transcription">
                <h4>Your Answer:</h4>
                <p className="answer-text">{interviewResults[interviewResults.length - 1]?.answer || ''}</p>
              </div>
              
              <div className="feedback-metrics">
                <div className="metric">
                  <span className="metric-label">Clarity</span>
                  <div className="metric-bar-container">
                    <div 
                      className="metric-bar" 
                      style={{ width: `${(interviewResults[interviewResults.length - 1]?.analysis?.clarity || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{interviewResults[interviewResults.length - 1]?.analysis?.clarity || 0}/10</span>
                </div>
                
                <div className="metric">
                  <span className="metric-label">Relevance</span>
                  <div className="metric-bar-container">
                    <div 
                      className="metric-bar" 
                      style={{ width: `${(interviewResults[interviewResults.length - 1]?.analysis?.relevance || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{interviewResults[interviewResults.length - 1]?.analysis?.relevance || 0}/10</span>
                </div>
                
                <div className="metric">
                  <span className="metric-label">Confidence</span>
                  <div className="metric-bar-container">
                    <div 
                      className="metric-bar" 
                      style={{ width: `${(interviewResults[interviewResults.length - 1]?.analysis?.confidence || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{interviewResults[interviewResults.length - 1]?.analysis?.confidence || 0}/10</span>
                </div>
              </div>
              
              <button
                className="next-button"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'} <FaArrowRight />
              </button>
            </div>
          )}
          
          {error && <div className="error-message"><FaTimes className="error-icon" /> {error}</div>}
        </div>
      )}
    </div>
  );
};

export default MockInterview; 