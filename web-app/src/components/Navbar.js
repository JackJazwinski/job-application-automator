import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaRobot, FaHome, FaClipboardList, FaTachometerAlt, FaHistory, FaCog } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <FaRobot className="navbar-icon" />
          <Link to="/" className="navbar-logo">JobBot</Link>
        </div>
        
        <ul className="navbar-menu">
          <li className={location.pathname === '/' ? 'navbar-item active' : 'navbar-item'}>
            <Link to="/" className="navbar-link">
              <FaHome className="navbar-link-icon" />
              <span>Home</span>
            </Link>
          </li>
          
          <li className={location.pathname === '/setup' ? 'navbar-item active' : 'navbar-item'}>
            <Link to="/setup" className="navbar-link">
              <FaClipboardList className="navbar-link-icon" />
              <span>Setup</span>
            </Link>
          </li>
          
          <li className={location.pathname === '/dashboard' ? 'navbar-item active' : 'navbar-item'}>
            <Link to="/dashboard" className="navbar-link">
              <FaTachometerAlt className="navbar-link-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          
          <li className={location.pathname === '/history' ? 'navbar-item active' : 'navbar-item'}>
            <Link to="/history" className="navbar-link">
              <FaHistory className="navbar-link-icon" />
              <span>History</span>
            </Link>
          </li>
          
          <li className={location.pathname === '/settings' ? 'navbar-item active' : 'navbar-item'}>
            <Link to="/settings" className="navbar-link">
              <FaCog className="navbar-link-icon" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;