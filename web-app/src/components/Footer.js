import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} JobBot - Automated Job Application Tool</p>
          <p>
            <small>
              This application is meant to assist with legitimate job applications.
              Ensure compliance with job site terms of service when using automated tools.
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;