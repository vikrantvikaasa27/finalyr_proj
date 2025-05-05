import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [interviewData, setInterviewData] = useState([]);
  const [resumeData, setResumeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load interview data from localStorage
    const loadInterviewData = () => {
      const storedInterviews = localStorage.getItem('interviewResults');
      if (storedInterviews) {
        try {
          const parsedData = JSON.parse(storedInterviews);
          // Ensure we have an array
          if (Array.isArray(parsedData)) {
            setInterviewData(parsedData);
          } else if (parsedData && typeof parsedData === 'object') {
            // If it's a single object, wrap it in an array
            setInterviewData([parsedData]);
          } else {
            console.error("Interview data is not in expected format:", parsedData);
            setInterviewData([]);
          }
        } catch (e) {
          console.error("Error parsing interview data:", e);
          setInterviewData([]);
        }
      } else {
        setInterviewData([]);
      }
    };

    // Load resume analysis data from localStorage
    const loadResumeData = () => {
      const storedResume = localStorage.getItem('resumeAnalysisResults');
      if (storedResume) {
        try {
          const parsedData = JSON.parse(storedResume);
          // Create a formatted data entry with today's date
          const formattedData = [{
            ...parsedData,
            date: new Date().toLocaleDateString()
          }];
          setResumeData(formattedData);
        } catch (e) {
          console.error('Error parsing resume data:', e);
          setResumeData([]);
        }
      }
    };

    loadInterviewData();
    loadResumeData();
    setIsLoading(false);
  }, []);

  const calculateStats = () => {
    const stats = {
      resumeScore: 0,
      interviewScore: 0,
      improvementPercentage: 0,
      recentActivities: []
    };

    // Calculate resume stats
    if (resumeData && resumeData.length > 0) {
      const latestResume = resumeData[resumeData.length - 1];
      stats.resumeScore = latestResume.ats_score || 0;
      
      // Add resume activities
      resumeData.forEach(resume => {
        if (resume && resume.ats_score) {
          stats.recentActivities.push({
            type: 'resume',
            date: resume.date || new Date().toLocaleDateString(),
            description: `Resume analyzed with ATS score: ${resume.ats_score}%`
          });
        }
      });
    }

    // Calculate interview stats
    if (interviewData && interviewData.length > 0) {
      const latestInterview = interviewData[interviewData.length - 1];
      stats.interviewScore = latestInterview.score || 0;
      
      // Add interview activities
      interviewData.forEach(interview => {
        if (interview) {
          stats.recentActivities.push({
            type: 'interview',
            date: interview.date || new Date().toLocaleDateString(),
            description: `Mock interview completed with score: ${interview.score || 0}%`
          });
        }
      });
    }

    // Calculate improvement percentage
    if (resumeData.length > 1) {
      const oldestScore = resumeData[0].ats_score || 0;
      const latestScore = resumeData[resumeData.length - 1].ats_score || 0;
      stats.improvementPercentage = Math.round(((latestScore - oldestScore) / oldestScore) * 100);
    }

    // Sort activities by date
    stats.recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    stats.recentActivities = stats.recentActivities.slice(0, 5);

    return stats;
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Track your progress and improve your career prospects</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'resume' ? 'active' : ''} 
          onClick={() => setActiveTab('resume')}
        >
          Resume History
        </button>
        <button 
          className={activeTab === 'interview' ? 'active' : ''} 
          onClick={() => setActiveTab('interview')}
        >
          Interview History
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Resume Score</h3>
              <div className="stat-value">{stats.resumeScore}%</div>
              <p>ATS Compatibility</p>
            </div>
            <div className="stat-card">
              <h3>Interview Score</h3>
              <div className="stat-value">{stats.interviewScore}%</div>
              <p>Latest Performance</p>
            </div>
            <div className="stat-card">
              <h3>Improvement</h3>
              <div className="stat-value">{stats.improvementPercentage}%</div>
              <p>Since First Analysis</p>
            </div>
          </div>

          <div className="recent-activities">
            <h2>Recent Activities</h2>
            {stats.recentActivities.length > 0 ? (
              <div className="activity-list">
                {stats.recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'resume' ? '📄' : '🎤'}
                    </div>
                    <div className="activity-details">
                      <p className="activity-description">{activity.description}</p>
                      <span className="activity-date">{activity.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No recent activities to display</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="resume-history">
          <h2>Resume Analysis History</h2>
          {resumeData && resumeData.length > 0 ? (
            <div className="history-list">
              {resumeData.map((resume, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <h3>Resume Analysis - {resume && resume.date ? new Date(resume.date).toLocaleDateString() : new Date().toLocaleDateString()}</h3>
                    <div className="history-score">Score: {resume && resume.ats_score !== undefined ? resume.ats_score : 'N/A'}%</div>
                  </div>
                  <div className="history-content">
                    <div className="history-section">
                      <h4>Summary</h4>
                      <p>{resume && resume.summary ? resume.summary : 'No summary available'}</p>
                    </div>
                    <div className="history-section">
                      <h4>Improvements Recommended</h4>
                      {resume && resume.improvements && Array.isArray(resume.improvements) && resume.improvements.length > 0 ? (
                        <ul>
                          {resume.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No improvements data available</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No resume analysis history available</p>
          )}
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="interview-history">
          <h2>Mock Interview History</h2>
          {interviewData && interviewData.length > 0 ? (
            <div className="history-list">
              {interviewData.map((interview, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <h3>Mock Interview - {interview && interview.date ? new Date(interview.date).toLocaleDateString() : 'No date'}</h3>
                    <div className="history-score">Score: {interview && interview.score !== undefined ? `${interview.score}/10` : 'N/A'}</div>
                  </div>
                  <div className="history-content">
                    <div className="history-section">
                      <h4>Questions and Answers</h4>
                      {interview && interview.results && Array.isArray(interview.results) && interview.results.length > 0 ? (
                        <div className="qa-list">
                          {interview.results.map((result, i) => (
                            <div key={i} className="qa-item">
                              <p className="question"><strong>Q{i + 1}:</strong> {result && result.question ? result.question : 'N/A'}</p>
                              <p className="answer"><strong>A:</strong> {result && result.answer ? result.answer : 'N/A'}</p>
                              <p className="feedback"><strong>Feedback:</strong> {result && result.feedback ? result.feedback : 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No questions and answers recorded.</p>
                      )}
                    </div>
                    {interview && interview.overallFeedback ? (
                      <>
                        <div className="history-section">
                          <h4>Key Strengths</h4>
                          {interview.overallFeedback.strengths && Array.isArray(interview.overallFeedback.strengths) && interview.overallFeedback.strengths.length > 0 ? (
                            <ul>
                              {interview.overallFeedback.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No specific strengths identified.</p>
                          )}
                        </div>
                        <div className="history-section">
                          <h4>Areas for Improvement</h4>
                          {interview.overallFeedback.improvements && Array.isArray(interview.overallFeedback.improvements) && interview.overallFeedback.improvements.length > 0 ? (
                            <ul>
                              {interview.overallFeedback.improvements.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No specific areas for improvement identified.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="history-section">
                        <p>No detailed feedback available.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No interview history available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 