import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Prepare for Your Dream Career</h1>
          <p>Get AI-powered resume analysis and practice interviews to land your dream job</p>
          <div className="hero-buttons">
            <Link to="/resume-analyzer" className="cta-button primary">Analyze Resume</Link>
            <Link to="/mock-interview" className="cta-button secondary">Practice Interview</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose CareerPrep Pro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Resume Analysis</h3>
            <p>Get detailed feedback on your resume's ATS compatibility and improvement suggestions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Mock Interviews</h3>
            <p>Practice with AI-powered interviews and get instant feedback on your performance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement over time with detailed analytics and insights</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Resume</h3>
            <p>Start by uploading your resume in PDF format</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Analysis</h3>
            <p>Receive detailed feedback and improvement suggestions</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Practice Interview</h3>
            <p>Engage in a realistic mock interview session</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your improvement in your personal dashboard</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Boost Your Career?</h2>
        <p>Join thousands of professionals who have improved their job prospects with CareerPrep Pro</p>
        <Link to="/register" className="cta-button primary">Get Started Now</Link>
      </section>
    </div>
  );
};

export default LandingPage; 