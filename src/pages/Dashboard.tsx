import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.scss';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('student');
  
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('userRole') || 'student';
    setUserName(name);
    setUserRole(role);
  }, []);

  const user = {
    name: userName,
    coursesInProgress: 2,
    coursesCompleted: 1,
    certifications: 0,
    walletBalance: 125.50,
    xp: 1500,
    level: 'Apprentice',
  };

  // Match course IDs with GamifiedLearning MODULE_CONTENT
  const recentActivity = [
    { id: 'python', title: 'Python Fundamentals', progress: 45, icon: 'code', color: '#3776ab' },
    { id: 'ai', title: 'AI & Machine Learning', progress: 12, icon: 'smart_toy', color: '#7000ff' },
    { id: 'physics', title: 'Physics Foundations', progress: 0, icon: 'science', color: '#ff6b35' },
  ];

  const recommendedJobs = [
    { title: 'Junior Web Developer', company: 'TechZim', match: 85 },
    { title: 'Data Entry Specialist', company: 'FinServe', match: 72 },
  ];

  const quickActions = [
    { icon: 'school', label: 'Learn', path: '/learn', color: '#00f2ff' },
    { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet', color: '#22c55e' },
    { icon: 'work', label: 'Jobs', path: '/jobs', color: '#ffb800' },
    { icon: 'groups', label: 'Community', path: '/community', color: '#7000ff' },
  ];

  const handleStartLearning = (courseId: string, moduleId: number = 1) => {
    navigate(`/learn/gamified/${courseId}/${moduleId}`);
  };

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <Link to="/" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Home
        </Link>
        <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
        <p>Continue your learning journey to unlock job opportunities.</p>
        
        {/* XP Progress Bar */}
        <div className="xp-header">
          <span className="xp-level">Level: {user.level}</span>
          <div className="xp-progress">
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${(user.xp % 1000) / 10}%` }}></div>
            </div>
            <span className="xp-text">{user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.path} className="quick-action" style={{ '--accent': action.color } as React.CSSProperties}>
            <span className="material-symbols-outlined">{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="material-symbols-outlined">school</span>
          <div className="stat-info">
            <h3>{user.coursesInProgress}</h3>
            <p>Courses In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined">verified</span>
          <div className="stat-info">
            <h3>{user.certifications}</h3>
            <p>Certifications</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/wallet')} style={{ cursor: 'pointer' }}>
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <div className="stat-info">
            <h3>${user.walletBalance.toFixed(2)}</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined">star</span>
          <div className="stat-info">
            <h3>{user.xp.toLocaleString()}</h3>
            <p>Total XP</p>
          </div>
        </div>
      </div>

      <div className="content-sections">
        <section className="section">
          <h2>Continue Learning</h2>
          <div className="activity-list">
            {recentActivity.map((item, i) => (
              <div key={i} className="activity-item" onClick={() => handleStartLearning(item.id)} style={{ cursor: 'pointer' }}>
                <div className="course-icon" style={{ background: item.color + '20', color: item.color }}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="activity-info">
                  <h4>{item.title}</h4>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.progress}%`, background: item.color }}></div>
                  </div>
                </div>
                <span className="progress-text">{item.progress}%</span>
                <span className="material-symbols-outlined play-icon">play_circle</span>
              </div>
            ))}
          </div>
          <Link to="/learn" className="view-all">View All Courses →</Link>
        </section>

        <section className="section">
          <h2>Recommended Jobs</h2>
          <div className="jobs-preview">
            {user.certifications === 0 ? (
              <div className="locked-message">
                <span className="material-symbols-outlined">lock</span>
                <p>Complete a certification to unlock job opportunities!</p>
                <Link to="/certify" className="unlock-btn">Get Certified</Link>
              </div>
            ) : (
              recommendedJobs.map((job, i) => (
                <div key={i} className="job-item">
                  <h4>{job.title}</h4>
                  <p>{job.company}</p>
                  <span className="match">{job.match}% match</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Career Tools Section */}
        <section className="section career-tools">
          <h2>Career Tools</h2>
          <div className="tools-grid">
            <Link to="/portfolio" className="tool-card">
              <span className="material-symbols-outlined">person</span>
              <h4>Portfolio</h4>
              <p>Build your professional profile</p>
            </Link>
            <Link to="/cv-generator" className="tool-card">
              <span className="material-symbols-outlined">description</span>
              <h4>CV Generator</h4>
              <p>Create AI-powered resumes</p>
            </Link>
            <Link to="/career-guidance" className="tool-card">
              <span className="material-symbols-outlined">psychology</span>
              <h4>Career Guide</h4>
              <p>AI career counseling</p>
            </Link>
            <Link to="/wallet" className="tool-card">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <h4>Wallet</h4>
              <p>Gigs, vouchers & earnings</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Role-based quick access */}
      {userRole === 'admin' && (
        <div className="role-access">
          <Link to="/admin" className="role-btn admin">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            Admin Dashboard
          </Link>
        </div>
      )}
      {userRole === 'client' && (
        <div className="role-access">
          <Link to="/client-portal" className="role-btn client">
            <span className="material-symbols-outlined">business</span>
            Client Portal
          </Link>
        </div>
      )}
    </div>
  );
}
