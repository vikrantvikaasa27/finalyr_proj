import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ResumeAnalyzer.css';
import { FaFileUpload, FaSearch, FaBriefcase, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaSpinner } from 'react-icons/fa';

const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [dragActive, setDragActive] = useState(false);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setResumeFile(null);
      setError('Please upload a PDF file for your resume');
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
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
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF file for your resume');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const data = await response.json();
      setResults(data);
      
      // Create a resume analysis result object with timestamp
      const resumeAnalysisResult = {
        date: new Date().toISOString(),
        resumeName: resumeFile.name,
        jobDescription: jobDescription || 'No job description provided',
        analysis: data
      };
      
      // Get existing resume analyses from localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('resumeAnalyses') || '[]');
      
      // Add new analysis to the array and save back to localStorage
      localStorage.setItem('resumeAnalyses', JSON.stringify([...savedAnalyses, resumeAnalysisResult]));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!results) return null;
    
    switch(activeTab) {
      case 'summary':
        return (
          <div className="tab-content summary-tab animate-fade-in">
            <div className="score-container">
              <div className="score-circle primary">
                <h2>{results.ats_score}%</h2>
                <p>ATS Score</p>
              </div>
              {results.match_score && (
                <div className="score-circle secondary">
                  <h2>{results.match_score}%</h2>
                  <p>Job Match</p>
                </div>
              )}
            </div>
            <div className="summary-text">
              <h3>Summary Analysis</h3>
              <p>{results.summary}</p>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="tab-content skills-tab animate-fade-in">
            <div className="skills-container">
              <div className="skills-section">
                <h3>Matching Skills</h3>
                {results.matching_skills && results.matching_skills.length > 0 ? (
                  <ul className="skills-list matching">
                    {results.matching_skills.map((skill, index) => (
                      <li key={index} className="skill-item matched"><FaCheckCircle className="icon-success" /> {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-skills-message">No specific matching skills identified. Upload with a job description to see matching skills.</p>
                )}
              </div>
              <div className="skills-section">
                <h3>Missing Skills</h3>
                {results.missing_skills && results.missing_skills.length > 0 ? (
                  <ul className="skills-list missing">
                    {results.missing_skills.map((skill, index) => (
                      <li key={index} className="skill-item missing"><FaExclamationTriangle className="icon-warning" /> {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-skills-message">No missing skills identified. Great job matching the requirements!</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'improvements':
        return (
          <div className="tab-content improvements-tab animate-fade-in">
            <h3>Recommended Improvements</h3>
            <ol className="improvements-list">
              {results.improvements.map((improvement, index) => (
                <li key={index} className="improvement-item">
                  <div className="improvement-number">{index + 1}</div>
                  <p className="improvement-text">{improvement}</p>
                </li>
              ))}
            </ol>
          </div>
        );
      case 'jobs':
        return (
          <div className="tab-content jobs-tab animate-fade-in">
            <h3>Recommended Jobs</h3>
            <div className="jobs-container">
              {results.recommended_jobs.map((job, index) => (
                <div key={index} className="job-card">
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <span className="job-match">{job.match_percentage}% Match</span>
                  </div>
                  <p className="job-company">{job.company}</p>
                  <p className="job-description">{job.description}</p>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
                    View Job <FaArrowRight />
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="resume-analyzer-container">
      <header className="analyzer-header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume and get personalized insights to land your dream job</p>
      </header>
      
      <div className="analyzer-content">
        <div className="upload-section">
          <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
            <div className="file-upload-container">
              <div className="section-label">
                <label className="section-title">Resume Upload</label>
                <span className="required-indicator">*Required</span>
              </div>
              <div 
                className={`file-upload-area${dragActive ? ' drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-content">
                  <FaFileUpload className="upload-icon" />
                  <p className="upload-text">
                    {resumeFile ? resumeFile.name : 'Drag & drop or click to upload resume (PDF)'}
                  </p>
                  <label htmlFor="resume-upload" className="upload-button">
                    Select File
                  </label>
                  <input
                    type="file"
                    id="resume-upload"
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    className="hidden-input"
                  />
                </div>
              </div>
              
              <div className="job-description">
                <label htmlFor="job-description">Job Description (Optional)</label>
                <textarea
                  id="job-description"
                  placeholder="Paste the job description here to get a personalized match score..."
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="analyze-button"
                disabled={isLoading || !resumeFile}
              >
                {isLoading ? <><FaSpinner className="spinner" /> Analyzing...</> : 'Analyze Resume'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
        
        {results && (
          <div className="results-section">
            <div className="tabs">
              <button 
                className={activeTab === 'summary' ? 'active' : ''} 
                onClick={() => setActiveTab('summary')}
              >
                <FaChartLine /> Summary
              </button>
              <button 
                className={activeTab === 'skills' ? 'active' : ''} 
                onClick={() => setActiveTab('skills')}
              >
                <FaSearch /> Skills Analysis
              </button>
              <button 
                className={activeTab === 'improvements' ? 'active' : ''} 
                onClick={() => setActiveTab('improvements')}
              >
                <FaCheckCircle /> Improvements
              </button>
              <button 
                className={activeTab === 'jobs' ? 'active' : ''} 
                onClick={() => setActiveTab('jobs')}
              >
                <FaBriefcase /> Recommended Jobs
              </button>
            </div>
            
            {renderTabContent()}
          </div>
        )}
      </div>

      <div className="mock-interview-link">
        <Link to="/mock-interview">
          <button className="interview-button">Try Mock Interview <FaArrowRight /></button>
        </Link>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;