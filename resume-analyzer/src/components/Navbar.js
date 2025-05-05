import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="CareerPrep Pro" className="logo" />
            <span className="logo-text">InterviewPrep.AI</span>
          </Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/resume-analyzer" className="nav-link">Resume Analyzer</Link>
          <Link to="/mock-interview" className="nav-link">Mock Interview</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </div>
        
        <div className="navbar-auth">
          <Link to="/login" className="auth-link">Login</Link>
          <Link to="/register" className="auth-link register">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 