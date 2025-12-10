import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.scss';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <nav className="mobile-nav" onClick={e => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <h2>Menu</h2>
            <button onClick={() => setMenuOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <Link to="/learn" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">school</span> Learn
          </Link>
          <Link to="/certify" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">verified</span> Certify
          </Link>
          <Link to="/jobs" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">work</span> Jobs
          </Link>
          <Link to="/connect" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">groups</span> Connect
          </Link>
          <Link to="/wallet" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">account_balance_wallet</span> Wallet
          </Link>
          <div className="nav-divider"></div>
          <Link to="/client" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">business</span> Client Portal
          </Link>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <nav className="landing-nav">
          <div className="logo">
            <img src="/econet-logo.png" alt="Econet" className="econet-logo" />
            <h1>U2M<span>Unyanzvi 2 Mari</span></h1>
          </div>
          <div className="nav-links desktop-only">
            <Link to="/learn" className="nav-link">Courses</Link>
            <Link to="/jobs" className="nav-link">Jobs</Link>
            <Link to="/client" className="nav-link">For Employers</Link>
            <Link to="/dashboard" className="nav-btn">Get Started</Link>
          </div>
          <button className="hamburger mobile-only" onClick={() => setMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">🚀 Powered by Econet Wireless Zimbabwe</div>
          <h1>Unyanzvi 2 Mari<span>.</span></h1>
          <p className="tagline">Turn Your Skills Into Income</p>
          <p>Master in-demand digital skills with AI-powered learning. <strong>All courses are FREE.</strong> Get certified. Access real job opportunities.</p>
          <div className="hero-actions">
            <Link to="/learn" className="btn-primary">
              Browse Free Courses
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link to="/client" className="btn-secondary">
              I'm Hiring Talent
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>5+</strong>
              <span>Free Courses</span>
            </div>
            <div className="stat">
              <strong>100+</strong>
              <span>Students</span>
            </div>
            <div className="stat">
              <strong>50+</strong>
              <span>Jobs Posted</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="floating-card card-1">
            <span className="material-symbols-outlined">smart_toy</span>
            <span>AI Tutor Ready</span>
          </div>
          <div className="floating-card card-2">
            <span className="material-symbols-outlined">verified</span>
            <span>Certified!</span>
          </div>
          <div className="floating-card card-3">
            <span className="material-symbols-outlined">payments</span>
            <span>+$500 Earned</span>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features" id="features">
        <h2>Your Path to Digital Success</h2>
        <p className="section-subtitle">Everything you need to build a career in tech — all free to start</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <h3>AI-Powered Learning</h3>
            <p>Learn from Gemini AI — an intelligent tutor that adapts to your pace and answers questions in real-time.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">money_off</span>
            </div>
            <h3>100% Free Courses</h3>
            <p>All courses are completely free. Learn web development, AI, data analytics, and more at no cost.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3>Affordable Certification</h3>
            <p>Pay only for certification when you're ready. Prove your skills to employers.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">work</span>
            </div>
            <h3>Real Job Opportunities</h3>
            <p>Get matched with companies looking for your exact skills.</p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-preview" id="courses">
        <h2>Free Courses Available Now</h2>
        <p className="section-subtitle">Enroll today and start learning with AI</p>
        
        <div className="course-tags">
          <span className="course-tag">🌐 Web Development</span>
          <span className="course-tag">🤖 AI & Machine Learning</span>
          <span className="course-tag">📊 Data Analytics</span>
          <span className="course-tag">📱 Digital Marketing</span>
          <span className="course-tag">🚀 Entrepreneurship</span>
        </div>
        
        <Link to="/learn" className="btn-primary" style={{ marginTop: '32px' }}>
          View All Courses
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Enroll Free</h3>
            <p>Browse courses and enroll in any that interest you — completely free.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Learn with AI</h3>
            <p>Start interactive lessons with our Gemini AI tutor that adapts to you.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Certified</h3>
            <p>When ready, pay for certification via EcoCash to prove your skills.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Start Earning</h3>
            <p>Access job opportunities and start your digital career.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Your Free Learning Journey?</h2>
        <p>Join thousands of Zimbabweans mastering digital skills with AI.</p>
        <Link to="/learn" className="btn-primary large">
          Start Learning — It's Free
          <span className="material-symbols-outlined">rocket_launch</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Future Work Zimbabwe</h3>
            <p>Empowering Zimbabwe's next generation workforce.</p>
          </div>
          <div className="footer-links">
            <Link to="/learn">Courses</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/client">For Employers</Link>
            <Link to="/connect">Community</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Future Work Zimbabwe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
