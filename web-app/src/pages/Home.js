import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaClipboardList, FaSearch, FaCheck } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <FaRobot className="hero-icon" />
          <h1>JobBot - Automated Job Application Tool</h1>
          <p>Streamline your job search by automating repetitive application tasks</p>
          <div className="hero-buttons">
            <Link to="/setup" className="btn btn-primary">Get Started</Link>
            <Link to="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Resume Parsing</h3>
            <p>Automatically extract key details from your resume to use in applications</p>
          </div>
          
          <div className="feature-card">
            <FaSearch className="feature-icon" />
            <h3>Job Search Automation</h3>
            <p>Automatically search for relevant jobs on LinkedIn and Indeed</p>
          </div>
          
          <div className="feature-card">
            <FaCheck className="feature-icon" />
            <h3>Easy Apply</h3>
            <p>Apply to jobs with just one click using "Easy Apply" options</p>
          </div>
          
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>Form Filling</h3>
            <p>Automatically fill out application forms with your resume data</p>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Setup Your Resume</h3>
            <p>Upload your resume and set your job preferences</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Job Site Credentials</h3>
            <p>Enter your login details for LinkedIn and Indeed</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Automation</h3>
            <p>Let JobBot search and apply to relevant jobs for you</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your application statistics and history</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Streamline Your Job Search?</h2>
        <Link to="/setup" className="btn btn-primary">Get Started Now</Link>
      </div>
    </div>
  );
};

export default Home;