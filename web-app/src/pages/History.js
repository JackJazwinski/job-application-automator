import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCheck, FaEye, FaTimes, FaClock } from 'react-icons/fa';
import './History.css';

const History = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  
  useEffect(() => {
    // In a real application, this would fetch data from the backend API
    // Here we'll simulate loading application history
    setTimeout(() => {
      // Mock application data
      const mockApplications = [
        { id: 1, jobTitle: 'Frontend Developer', company: 'Tech Co', date: '2024-02-28', status: 'applied', site: 'LinkedIn', url: 'https://linkedin.com/job/123' },
        { id: 2, jobTitle: 'React Developer', company: 'StartupXYZ', date: '2024-02-27', status: 'viewed', site: 'LinkedIn', url: 'https://linkedin.com/job/456' },
        { id: 3, jobTitle: 'Software Engineer', company: 'Big Enterprise', date: '2024-02-26', status: 'interview', site: 'Indeed', url: 'https://indeed.com/job/789' },
        { id: 4, jobTitle: 'Web Developer', company: 'Creative Agency', date: '2024-02-25', status: 'rejected', site: 'LinkedIn', url: 'https://linkedin.com/job/012' },
        { id: 5, jobTitle: 'Full Stack Developer', company: 'Digital Solutions', date: '2024-02-24', status: 'applied', site: 'Indeed', url: 'https://indeed.com/job/345' },
        { id: 6, jobTitle: 'Frontend Engineer', company: 'Product Inc', date: '2024-02-23', status: 'viewed', site: 'LinkedIn', url: 'https://linkedin.com/job/678' },
        { id: 7, jobTitle: 'JavaScript Developer', company: 'Web Services', date: '2024-02-22', status: 'responded', site: 'Indeed', url: 'https://indeed.com/job/901' },
        { id: 8, jobTitle: 'React Native Developer', company: 'Mobile Apps', date: '2024-02-21', status: 'applied', site: 'LinkedIn', url: 'https://linkedin.com/job/234' },
        { id: 9, jobTitle: 'Senior Developer', company: 'Enterprise Co', date: '2024-02-20', status: 'offer', site: 'Indeed', url: 'https://indeed.com/job/567' },
        { id: 10, jobTitle: 'UI Developer', company: 'Design Studio', date: '2024-02-19', status: 'rejected', site: 'LinkedIn', url: 'https://linkedin.com/job/890' },
      ];
      
      setApplications(mockApplications);
      setFilteredApplications(mockApplications);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = applications;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.jobTitle.toLowerCase().includes(term) ||
        app.company.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // Apply site filter
    if (siteFilter !== 'all') {
      result = result.filter(app => app.site === siteFilter);
    }
    
    setFilteredApplications(result);
  }, [searchTerm, statusFilter, siteFilter, applications]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <FaCheck className="status-icon applied" />;
      case 'viewed':
        return <FaEye className="status-icon viewed" />;
      case 'responded':
        return <FaCheck className="status-icon responded" />;
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
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleSiteFilterChange = (e) => {
    setSiteFilter(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner"></div>
        <p>Loading application history...</p>
      </div>
    );
  }
  
  return (
    <div className="history-page">
      <div className="container">
        <h1 className="history-title">Application History</h1>
        
        <div className="history-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by job title or company"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filters-container">
            <div className="filter">
              <FaFilter className="filter-icon" />
              <label htmlFor="statusFilter" className="filter-label">Status:</label>
              <select
                id="statusFilter"
                className="filter-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="viewed">Viewed</option>
                <option value="responded">Responded</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="filter">
              <label htmlFor="siteFilter" className="filter-label">Site:</label>
              <select
                id="siteFilter"
                className="filter-select"
                value={siteFilter}
                onChange={handleSiteFilterChange}
              >
                <option value="all">All Sites</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="applications-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Site</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td>{app.jobTitle}</td>
                    <td>{app.company}</td>
                    <td>{app.site}</td>
                    <td>{formatDate(app.date)}</td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(app.status)}
                        <span className={`status-text ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <a href={app.url} target="_blank" rel="noopener noreferrer" className="view-link">
                        View Job
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;