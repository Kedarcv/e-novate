import React from 'react';
import { Link } from 'react-router-dom';
import './Connect.scss';

export default function Connect() {
  return (
    <div className="connect-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <h1>Connect</h1>
        <p>Join the community and find mentors.</p>
      </div>

      <div className="connect-content">
        <div className="coming-soon">
          <span className="material-symbols-outlined">groups</span>
          <h2>Community Coming Soon</h2>
          <p>Connect with mentors, peers, and industry experts. Network, collaborate, and grow together.</p>
          <div className="features-preview">
            <div className="feature">
              <span className="material-symbols-outlined">forum</span>
              <span>Discussion Forums</span>
            </div>
            <div className="feature">
              <span className="material-symbols-outlined">support_agent</span>
              <span>1-on-1 Mentorship</span>
            </div>
            <div className="feature">
              <span className="material-symbols-outlined">event</span>
              <span>Live Events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
