import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaPause, FaEye, FaClock, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    // In a real application, this would fetch data from the backend API
    // Here we'll simulate loading dashboard data
    setTimeout(() => {
      // Mock dashboard data
      const mockData = {
        totalApplications: 47,
        applicationsByStatus: {
          applied: 47,
          viewed: 23,
          responded: 8,
          interview: 4,
          offer: 1,
          rejected: 12
        },
        applicationsBySite: {
          LinkedIn: 32,
          Indeed: 15
        },
        recentApplications: [
          { id: 1, jobTitle: 'Frontend Developer', company: 'Tech Co', date: '2024-02-28', status: 'applied' },
          { id: 2, jobTitle: 'React Developer', company: 'StartupXYZ', date: '2024-02-27', status: 'viewed' },
          { id: 3, jobTitle: 'Software Engineer', company: 'Big Enterprise', date: '2024-02-26', status: 'interview' },
          { id: 4, jobTitle: 'Web Developer', company: 'Creative Agency', date: '2024-02-25', status: 'rejected' },
          { id: 5, jobTitle: 'Full Stack Developer', company: 'Digital Solutions', date: '2024-02-24', status: 'applied' }
        ],
        lastRunDate: '2024-02-28T15:30:00Z',
        preferences: {
          jobTitle: 'Frontend Developer',
          location: 'San Francisco, CA',
          industry: 'Technology'
        }
      };
      
      setDashboardData(mockData);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  const toggleAutomation = () => {
    // In a real application, this would communicate with the backend API
    // to start or stop the automation process
    setIsAutomationRunning(!isAutomationRunning);
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <FaCheck className="status-icon applied" />;
      case 'viewed':
        return <FaEye className="status-icon viewed" />;
      case 'interview':
        return <FaCheck className="status-icon interview" />;
      case 'offer':
        return <FaCheck className="status-icon offer" />;
      case 'rejected':
        return <FaTimes className="status-icon rejected" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };
  
  // Prepare chart data
  const statusChartData = {
    labels: ['Applied', 'Viewed', 'Responded', 'Interview', 'Offer', 'Rejected'],
    datasets: [
      {
        data: dashboardData ? [
          dashboardData.applicationsByStatus.applied,
          dashboardData.applicationsByStatus.viewed,
          dashboardData.applicationsByStatus.responded,
          dashboardData.applicationsByStatus.interview,
          dashboardData.applicationsByStatus.offer,
          dashboardData.applicationsByStatus.rejected
        ] : [],
        backgroundColor: [
          '#4caf50',
          '#2196f3',
          '#ff9800',
          '#9c27b0',
          '#e91e63',
          '#f44336'
        ]
      }
    ]
  };
  
  const siteChartData = {
    labels: dashboardData ? Object.keys(dashboardData.applicationsBySite) : [],
    datasets: [
      {
        label: 'Applications by Site',
        data: dashboardData ? Object.values(dashboardData.applicationsBySite) : [],
        backgroundColor: ['#2a7de1', '#e91e63']
      }
    ]
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <div className="header-actions">
            {!hasConsent ? (
              <div className="consent-warning">
                <FaExclamationTriangle className="warning-icon" />
                <span>Consent required for automation</span>
                <Link to="/settings" className="btn btn-secondary btn-sm">Provide Consent</Link>
              </div>
            ) : (
              <button 
                className={`btn ${isAutomationRunning ? 'btn-secondary' : 'btn-primary'}`}
                onClick={toggleAutomation}
              >
                {isAutomationRunning ? (
                  <>
                    <FaPause className="btn-icon" />
                    <span>Pause Automation</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="btn-icon" />
                    <span>Start Automation</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-overview">
        <div className="overview-card">
          <div className="card-title">Total Applications</div>
          <div className="card-value">{dashboardData.totalApplications}</div>
        </div>
        
        <div className="overview-card">
          <div className="card-title">Interviews</div>
          <div className="card-value">{dashboardData.applicationsByStatus.interview}</div>
        </div>
        
        <div className="overview-card">
          <div className="card-title">Response Rate</div>
          <div className="card-value">
            {Math.round((dashboardData.applicationsByStatus.responded / dashboardData.totalApplications) * 100)}%
          </div>
        </div>
        
        <div className="overview-card">
          <div className="card-title">Last Run</div>
          <div className="card-value">{formatDate(dashboardData.lastRunDate)}</div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Job Search Preferences</h2>
            <Link to="/setup" className="btn btn-secondary btn-sm">Edit</Link>
          </div>
          <div className="preferences-container">
            <div className="preference-item">
              <strong>Job Title:</strong> {dashboardData.preferences.jobTitle}
            </div>
            <div className="preference-item">
              <strong>Location:</strong> {dashboardData.preferences.location}
            </div>
            <div className="preference-item">
              <strong>Industry:</strong> {dashboardData.preferences.industry}
            </div>
          </div>
        </div>
        
        <div className="dashboard-row">
          <div className="dashboard-column">
            <div className="dashboard-section">
              <h2>Application Status</h2>
              <div className="chart-container">
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-column">
            <div className="dashboard-section">
              <h2>Applications by Site</h2>
              <div className="chart-container">
                <Bar 
                  data={siteChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <Link to="/history" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="recent-applications">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentApplications.map(app => (
                  <tr key={app.id}>
                    <td>{app.jobTitle}</td>
                    <td>{app.company}</td>
                    <td>{formatDate(app.date)}</td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(app.status)}
                        <span className={`status-text ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;