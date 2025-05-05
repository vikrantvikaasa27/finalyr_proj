import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Resume Analyzer</h1>
        <p className="subtitle">Empowering job seekers with AI-powered career tools</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At Resume Analyzer, we believe that everyone deserves access to professional career development tools. 
            Our mission is to help job seekers present their best selves to potential employers through 
            AI-powered resume analysis and interview preparation.
          </p>
        </section>

        <section className="features-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Resume Analysis</h3>
              <p>
                Get detailed feedback on your resume's content, structure, and ATS compatibility. 
                Our AI analyzes your resume against industry standards and provides actionable improvements.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Job Matching</h3>
              <p>
                Find the perfect job matches based on your skills and experience. 
                Our algorithm analyzes job descriptions and matches them with your resume.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3>Mock Interviews</h3>
              <p>
                Practice interviews with AI-generated questions tailored to your resume and target positions. 
                Get real-time feedback on your answers.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>
                Monitor your improvement over time with detailed analytics and performance metrics. 
                Track your interview scores and resume improvements.
              </p>
            </div>
          </div>
        </section>

        <section className="technology-section">
          <h2>Our Technology</h2>
          <p>
            We leverage cutting-edge AI technology, including Google's Gemini model and Groq API, 
            to provide accurate and insightful analysis. Our platform uses advanced natural language 
            processing to understand your resume content and generate relevant interview questions.
          </p>
          <div className="tech-stack">
            <div className="tech-item">React.js</div>
            <div className="tech-item">Flask</div>
            <div className="tech-item">Nvidia - Deepseek</div>
            <div className="tech-item">Groq API</div>
            <div className="tech-item">Google Gemini</div>
            <div className="tech-item">PyPDF2</div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            We are a team of passionate developers and career experts dedicated to making the job search 
            process more accessible and effective. Our diverse backgrounds in software development, 
            HR, and career counseling help us create tools that truly make a difference.
          </p>
        </section>

        <section className="contact-section">
          <h2>Get in Touch</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you! 
            Reach out to us at <a href="mailto:contact@resumeanalyzer.com">contact@resumeanalyzer.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default About; 