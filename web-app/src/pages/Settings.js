import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaCheck, FaTimes, FaExclamationTriangle, FaShieldAlt, FaClock, FaBriefcase } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [hasConsent, setHasConsent] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Validation schema for automation settings
  const automationSchema = Yup.object().shape({
    dailyApplicationLimit: Yup.number()
      .min(1, 'Limit must be at least 1')
      .max(50, 'Limit cannot exceed 50')
      .required('Application limit is required'),
    runSchedule: Yup.string()
      .required('Schedule is required'),
    autoUpdateStatus: Yup.boolean(),
  });
  
  // Handle automation settings submission
  const handleAutomationSettingsSubmit = (values, { setSubmitting }) => {
    // In a real application, this would send the settings to a backend API
    console.log('Automation settings:', values);
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSubmitting(false);
    }, 3000);
  };
  
  // Toggle consent status
  const toggleConsent = () => {
    setHasConsent(!hasConsent);
  };
  
  return (
    <div className="settings-page">
      <div className="container">
        <h1 className="settings-title">Settings</h1>
        
        {showSuccessMessage && (
          <div className="alert alert-success">
            <FaCheck /> Settings updated successfully.
          </div>
        )}
        
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <FaShieldAlt className="section-icon" />
              Consent Management
            </h2>
          </div>
          
          <div className="consent-container">
            <div className="consent-info">
              <p>
                JobBot requires your consent to perform automated job applications on your behalf.
                By enabling consent, you confirm that you understand:
              </p>
              
              <ul className="consent-list">
                <li>JobBot will log into job sites using your credentials</li>
                <li>JobBot will search for jobs matching your preferences</li>
                <li>JobBot will submit applications on your behalf</li>
                <li>You are responsible for adhering to job site terms of service</li>
              </ul>
            </div>
            
            <div className="consent-toggle">
              <span className="toggle-label">Consent Status:</span>
              <div className={`consent-status ${hasConsent ? 'enabled' : 'disabled'}`}>
                {hasConsent ? (
                  <>
                    <FaCheck className="status-icon" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <FaTimes className="status-icon" />
                    <span>Disabled</span>
                  </>
                )}
              </div>
              <button 
                className={`btn ${hasConsent ? 'btn-secondary' : 'btn-primary'}`}
                onClick={toggleConsent}
              >
                {hasConsent ? 'Revoke Consent' : 'Provide Consent'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <FaClock className="section-icon" />
              Automation Settings
            </h2>
          </div>
          
          <Formik
            initialValues={{
              dailyApplicationLimit: 10,
              runSchedule: 'daily',
              autoUpdateStatus: true
            }}
            validationSchema={automationSchema}
            onSubmit={handleAutomationSettingsSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="settings-form">
                <div className="form-group">
                  <label htmlFor="dailyApplicationLimit" className="form-label">
                    Daily Application Limit
                  </label>
                  <Field 
                    name="dailyApplicationLimit" 
                    type="number" 
                    min="1" 
                    max="50" 
                    className="form-control" 
                  />
                  <ErrorMessage name="dailyApplicationLimit" component="div" className="error-message" />
                  <div className="form-help">
                    Maximum number of applications to submit per day.
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="runSchedule" className="form-label">
                    Run Schedule
                  </label>
                  <Field name="runSchedule" as="select" className="form-control">
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="custom">Custom Schedule</option>
                  </Field>
                  <ErrorMessage name="runSchedule" component="div" className="error-message" />
                  <div className="form-help">
                    When JobBot should run automation.
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <div className="checkbox-container">
                    <Field name="autoUpdateStatus" type="checkbox" id="autoUpdateStatus" className="form-checkbox" />
                    <label htmlFor="autoUpdateStatus" className="checkbox-label">
                      Automatically check and update application status
                    </label>
                  </div>
                  <div className="form-help">
                    Periodically check job sites for updates on your applications.
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
        
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <FaBriefcase className="section-icon" />
              Job Site Accounts
            </h2>
          </div>
          
          <div className="accounts-container">
            <div className="account-card">
              <div className="account-header">
                <h3>LinkedIn</h3>
                <div className="account-status connected">Connected</div>
              </div>
              <div className="account-email">user@example.com</div>
              <div className="account-actions">
                <button className="btn btn-secondary btn-sm">Update Credentials</button>
              </div>
            </div>
            
            <div className="account-card">
              <div className="account-header">
                <h3>Indeed</h3>
                <div className="account-status connected">Connected</div>
              </div>
              <div className="account-email">user@example.com</div>
              <div className="account-actions">
                <button className="btn btn-secondary btn-sm">Update Credentials</button>
              </div>
            </div>
            
            <div className="account-card">
              <div className="account-header">
                <h3>Glassdoor</h3>
                <div className="account-status disconnected">Not Connected</div>
              </div>
              <div className="account-actions">
                <button className="btn btn-primary btn-sm">Add Account</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-section danger-zone">
          <div className="section-header">
            <h2>
              <FaExclamationTriangle className="section-icon" />
              Danger Zone
            </h2>
          </div>
          
          <div className="danger-actions">
            <div className="danger-action">
              <div className="danger-action-info">
                <h3>Clear Application History</h3>
                <p>This will permanently remove all application records.</p>
              </div>
              <button className="btn btn-danger">Clear History</button>
            </div>
            
            <div className="danger-action">
              <div className="danger-action-info">
                <h3>Reset Settings</h3>
                <p>Reset all settings to default values.</p>
              </div>
              <button className="btn btn-danger">Reset</button>
            </div>
            
            <div className="danger-action">
              <div className="danger-action-info">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data.</p>
              </div>
              <button className="btn btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;