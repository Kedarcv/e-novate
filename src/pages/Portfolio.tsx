import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './Portfolio.scss';

interface Skill {
  name: string;
  level: number; // 1-100
  endorsements: number;
  category: 'technical' | 'soft' | 'language';
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  link?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  featured: boolean;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  activities?: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  badge?: string;
}

interface PortfolioData {
  // Profile
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  profileImage?: string;
  bannerImage?: string;
  
  // Stats from U2M
  totalXP: number;
  coursesCompleted: number;
  certificationsEarned: number;
  rank: string;
  tokens: number;
  
  // Content
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  
  // Availability
  openToWork: boolean;
  openToFreelance: boolean;
  preferredRoles: string[];
  expectedSalary?: string;
}

export default function Portfolio() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'experience' | 'education' | 'skills'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    name: userName,
    headline: 'Software Developer | U2M Certified',
    bio: 'Passionate learner and developer focused on building innovative solutions. Currently expanding my skills through the U2M platform.',
    location: 'Harare, Zimbabwe',
    email: 'user@example.com',
    phone: '+263 77 123 4567',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    profileImage: '',
    bannerImage: '',
    
    totalXP: 2450,
    coursesCompleted: 5,
    certificationsEarned: 3,
    rank: 'Rising Star',
    tokens: 150,
    
    skills: [
      { name: 'Python', level: 85, endorsements: 12, category: 'technical' },
      { name: 'JavaScript', level: 78, endorsements: 8, category: 'technical' },
      { name: 'React', level: 72, endorsements: 6, category: 'technical' },
      { name: 'Machine Learning', level: 65, endorsements: 4, category: 'technical' },
      { name: 'Problem Solving', level: 90, endorsements: 15, category: 'soft' },
      { name: 'Communication', level: 88, endorsements: 10, category: 'soft' },
      { name: 'English', level: 95, endorsements: 5, category: 'language' },
      { name: 'Shona', level: 100, endorsements: 3, category: 'language' },
    ],
    
    projects: [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce solution with payment integration, inventory management, and analytics dashboard.',
        technologies: ['React', 'Node.js', 'MongoDB', 'EcoCash API'],
        startDate: '2024-01-01',
        endDate: '2024-03-15',
        featured: true,
      },
      {
        id: '2',
        title: 'AI Chatbot',
        description: 'Customer service chatbot powered by machine learning for automated support.',
        technologies: ['Python', 'TensorFlow', 'Flask', 'NLP'],
        startDate: '2024-02-01',
        featured: false,
      },
    ],
    
    experience: [
      {
        id: '1',
        title: 'Junior Developer',
        company: 'Tech Solutions Zim',
        location: 'Harare, Zimbabwe',
        type: 'full-time',
        startDate: '2024-01-01',
        current: true,
        description: 'Developing web applications using modern technologies. Working on client projects and internal tools.',
        skills: ['JavaScript', 'React', 'Node.js'],
      },
    ],
    
    education: [
      {
        id: '1',
        institution: 'University of Zimbabwe',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2020-03-01',
        endDate: '2024-11-30',
        current: false,
        grade: '2.1 Upper',
        activities: ['Computer Science Society', 'Hackathon Club'],
      },
    ],
    
    certifications: [
      {
        id: '1',
        name: 'Python Fundamentals',
        issuer: 'U2M - Unyanzvi 2 Mari',
        issueDate: '2024-06-15',
        credentialId: 'U2M-PY-2024-001',
        badge: 'python',
      },
      {
        id: '2',
        name: 'Web Development Essentials',
        issuer: 'U2M - Unyanzvi 2 Mari',
        issueDate: '2024-08-20',
        credentialId: 'U2M-WEB-2024-002',
        badge: 'web',
      },
    ],
    
    openToWork: true,
    openToFreelance: true,
    preferredRoles: ['Full Stack Developer', 'Frontend Developer', 'Python Developer'],
    expectedSalary: '$800 - $1500/month',
  });

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    technologies: [],
    startDate: '',
    featured: false,
  });

  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    startDate: '',
    current: false,
    description: '',
    skills: [],
  });

  const handleSaveProfile = () => {
    // Save to localStorage or backend
    localStorage.setItem('userPortfolio', JSON.stringify(portfolio));
    setIsEditing(false);
  };

  const handleAddProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title || '',
      description: newProject.description || '',
      technologies: newProject.technologies || [],
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      featured: newProject.featured || false,
    };
    setPortfolio(prev => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
    setNewProject({ title: '', description: '', technologies: [], startDate: '', featured: false });
    setShowAddModal(null);
  };

  const handleAddExperience = () => {
    const exp: Experience = {
      id: Date.now().toString(),
      title: newExperience.title || '',
      company: newExperience.company || '',
      location: newExperience.location || '',
      type: newExperience.type || 'full-time',
      startDate: newExperience.startDate || new Date().toISOString().split('T')[0],
      current: newExperience.current || false,
      description: newExperience.description || '',
      skills: newExperience.skills || [],
    };
    setPortfolio(prev => ({
      ...prev,
      experience: [...prev.experience, exp],
    }));
    setNewExperience({ title: '', company: '', location: '', type: 'full-time', startDate: '', current: false, description: '', skills: [] });
    setShowAddModal(null);
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return '#22c55e';
    if (level >= 60) return '#3b82f6';
    if (level >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="portfolio-page">
      <AnimatedBackground variant="gradient" primaryColor="#6366f1" secondaryColor="#1e1b4b" />
      
      {/* Header Actions */}
      <div className="portfolio-actions">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined">arrow_back</span> Back
        </button>
        <div className="action-buttons">
          <button className="btn-cv" onClick={() => navigate('/cv-generator')}>
            <span className="material-symbols-outlined">description</span> Generate CV
          </button>
          <button className="btn-career" onClick={() => navigate('/career-guidance')}>
            <span className="material-symbols-outlined">trending_up</span> Career Guidance
          </button>
          {isEditing ? (
            <button className="btn-save" onClick={handleSaveProfile}>
              <span className="material-symbols-outlined">save</span> Save
            </button>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <span className="material-symbols-outlined">edit</span> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <section className="profile-header">
        <div className="banner" style={{ backgroundImage: portfolio.bannerImage ? `url(${portfolio.bannerImage})` : undefined }}>
          {isEditing && (
            <button className="btn-edit-banner">
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
          )}
        </div>
        
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar">
              {portfolio.profileImage ? (
                <img src={portfolio.profileImage} alt={portfolio.name} />
              ) : (
                <span className="avatar-initial">{portfolio.name.charAt(0)}</span>
              )}
              {portfolio.openToWork && <span className="open-badge">Open to Work</span>}
            </div>
          </div>
          
          <div className="info-section">
            <div className="name-row">
              {isEditing ? (
                <input 
                  type="text" 
                  value={portfolio.name} 
                  onChange={(e) => setPortfolio(p => ({ ...p, name: e.target.value }))}
                  className="edit-input name"
                />
              ) : (
                <h1>{portfolio.name}</h1>
              )}
              <div className="verification-badges">
                <span className="badge verified" title="U2M Verified">
                  <span className="material-symbols-outlined">verified</span>
                </span>
                <span className="badge rank" title={`Rank: ${portfolio.rank}`}>
                  <span className="material-symbols-outlined">star</span> {portfolio.rank}
                </span>
              </div>
            </div>
            
            {isEditing ? (
              <input 
                type="text" 
                value={portfolio.headline} 
                onChange={(e) => setPortfolio(p => ({ ...p, headline: e.target.value }))}
                className="edit-input headline"
              />
            ) : (
              <p className="headline">{portfolio.headline}</p>
            )}
            
            <div className="meta-info">
              <span><span className="material-symbols-outlined">location_on</span> {portfolio.location}</span>
              <span><span className="material-symbols-outlined">mail</span> {portfolio.email}</span>
              {portfolio.website && <span><span className="material-symbols-outlined">language</span> {portfolio.website}</span>}
            </div>
            
            {/* U2M Stats */}
            <div className="u2m-stats">
              <div className="stat">
                <span className="value">{portfolio.totalXP.toLocaleString()}</span>
                <span className="label">XP Earned</span>
              </div>
              <div className="stat">
                <span className="value">{portfolio.coursesCompleted}</span>
                <span className="label">Courses</span>
              </div>
              <div className="stat">
                <span className="value">{portfolio.certificationsEarned}</span>
                <span className="label">Certifications</span>
              </div>
              <div className="stat tokens">
                <span className="value">{portfolio.tokens}</span>
                <span className="label">U2M Tokens</span>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            {portfolio.linkedin && (
              <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                LinkedIn
              </a>
            )}
            {portfolio.github && (
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                GitHub
              </a>
            )}
            <button className="btn-share">
              <span className="material-symbols-outlined">share</span> Share Profile
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="portfolio-nav">
        {(['overview', 'projects', 'experience', 'education', 'skills'] as const).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content Sections */}
      <main className="portfolio-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* About Section */}
            <section className="about-section card">
              <h2><span className="material-symbols-outlined">person</span> About</h2>
              {isEditing ? (
                <textarea 
                  value={portfolio.bio} 
                  onChange={(e) => setPortfolio(p => ({ ...p, bio: e.target.value }))}
                  className="edit-textarea"
                  rows={4}
                />
              ) : (
                <p>{portfolio.bio}</p>
              )}
            </section>

            {/* Featured Projects */}
            <section className="featured-projects card">
              <h2><span className="material-symbols-outlined">star</span> Featured Projects</h2>
              <div className="projects-grid">
                {portfolio.projects.filter(p => p.featured).map(project => (
                  <div key={project.id} className="project-card">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tech-tags">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Skills */}
            <section className="top-skills card">
              <h2><span className="material-symbols-outlined">psychology</span> Top Skills</h2>
              <div className="skills-list">
                {portfolio.skills.slice(0, 5).map((skill, i) => (
                  <div key={i} className="skill-item">
                    <div className="skill-header">
                      <span className="name">{skill.name}</span>
                      <span className="endorsements">{skill.endorsements} endorsements</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${skill.level}%`, backgroundColor: getSkillColor(skill.level) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section className="certifications-section card">
              <h2><span className="material-symbols-outlined">workspace_premium</span> Certifications</h2>
              <div className="certifications-list">
                {portfolio.certifications.map(cert => (
                  <div key={cert.id} className="cert-card">
                    <div className="cert-badge">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div className="cert-info">
                      <h4>{cert.name}</h4>
                      <p className="issuer">{cert.issuer}</p>
                      <p className="date">Issued {new Date(cert.issueDate).toLocaleDateString()}</p>
                      {cert.credentialId && <p className="credential">ID: {cert.credentialId}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Work Preferences */}
            {(portfolio.openToWork || portfolio.openToFreelance) && (
              <section className="work-preferences card">
                <h2><span className="material-symbols-outlined">work</span> Open To</h2>
                <div className="preferences-content">
                  {portfolio.openToWork && (
                    <div className="preference-badge">
                      <span className="material-symbols-outlined">business_center</span>
                      Full-time Opportunities
                    </div>
                  )}
                  {portfolio.openToFreelance && (
                    <div className="preference-badge">
                      <span className="material-symbols-outlined">laptop_mac</span>
                      Freelance Projects
                    </div>
                  )}
                  <div className="preferred-roles">
                    <h4>Preferred Roles:</h4>
                    <div className="role-tags">
                      {portfolio.preferredRoles.map((role, i) => (
                        <span key={i} className="role-tag">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="projects-tab">
            <div className="tab-header">
              <h2>Projects ({portfolio.projects.length})</h2>
              <button className="btn-add" onClick={() => setShowAddModal('project')}>
                <span className="material-symbols-outlined">add</span> Add Project
              </button>
            </div>
            <div className="projects-grid full">
              {portfolio.projects.map(project => (
                <div key={project.id} className="project-card-full">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    {project.featured && <span className="featured-badge">Featured</span>}
                  </div>
                  <p className="description">{project.description}</p>
                  <div className="tech-tags">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tag">{tech}</span>
                    ))}
                  </div>
                  <div className="project-meta">
                    <span className="date">
                      {new Date(project.startDate).toLocaleDateString()} 
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ' - Present'}
                    </span>
                  </div>
                  <div className="project-actions">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-link">
                        <span className="material-symbols-outlined">open_in_new</span> View Project
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-github">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="experience-tab">
            <div className="tab-header">
              <h2>Experience ({portfolio.experience.length})</h2>
              <button className="btn-add" onClick={() => setShowAddModal('experience')}>
                <span className="material-symbols-outlined">add</span> Add Experience
              </button>
            </div>
            <div className="timeline">
              {portfolio.experience.map((exp, i) => (
                <div key={exp.id} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="experience-card">
                    <div className="exp-header">
                      <h3>{exp.title}</h3>
                      <span className={`type-badge ${exp.type}`}>{exp.type}</span>
                    </div>
                    <p className="company">{exp.company}</p>
                    <p className="location-date">
                      <span className="material-symbols-outlined">location_on</span> {exp.location} • 
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                    </p>
                    <p className="description">{exp.description}</p>
                    <div className="skills-used">
                      {exp.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="education-tab">
            <div className="tab-header">
              <h2>Education ({portfolio.education.length})</h2>
              <button className="btn-add" onClick={() => setShowAddModal('education')}>
                <span className="material-symbols-outlined">add</span> Add Education
              </button>
            </div>
            <div className="education-list">
              {portfolio.education.map(edu => (
                <div key={edu.id} className="education-card">
                  <div className="edu-icon">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="edu-info">
                    <h3>{edu.institution}</h3>
                    <p className="degree">{edu.degree} in {edu.field}</p>
                    <p className="dates">
                      {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                    </p>
                    {edu.grade && <p className="grade">Grade: {edu.grade}</p>}
                    {edu.activities && edu.activities.length > 0 && (
                      <div className="activities">
                        <span>Activities:</span> {edu.activities.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications in Education Tab */}
            <div className="certifications-section">
              <h2>Certifications & Courses</h2>
              <div className="certs-grid">
                {portfolio.certifications.map(cert => (
                  <div key={cert.id} className="cert-card-full">
                    <div className="cert-icon">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div className="cert-details">
                      <h4>{cert.name}</h4>
                      <p className="issuer">{cert.issuer}</p>
                      <p className="date">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                      {cert.credentialId && <p className="credential-id">Credential ID: {cert.credentialId}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="skills-tab">
            <div className="tab-header">
              <h2>Skills ({portfolio.skills.length})</h2>
              <button className="btn-add" onClick={() => setShowAddModal('skill')}>
                <span className="material-symbols-outlined">add</span> Add Skill
              </button>
            </div>

            {/* Technical Skills */}
            <section className="skill-category">
              <h3><span className="material-symbols-outlined">code</span> Technical Skills</h3>
              <div className="skills-grid">
                {portfolio.skills.filter(s => s.category === 'technical').map((skill, i) => (
                  <div key={i} className="skill-card">
                    <div className="skill-top">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${skill.level}%`, backgroundColor: getSkillColor(skill.level) }}
                      />
                    </div>
                    <div className="endorsements">
                      <span className="material-symbols-outlined">thumb_up</span> {skill.endorsements} endorsements
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Soft Skills */}
            <section className="skill-category">
              <h3><span className="material-symbols-outlined">psychology</span> Soft Skills</h3>
              <div className="skills-grid">
                {portfolio.skills.filter(s => s.category === 'soft').map((skill, i) => (
                  <div key={i} className="skill-card">
                    <div className="skill-top">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${skill.level}%`, backgroundColor: getSkillColor(skill.level) }}
                      />
                    </div>
                    <div className="endorsements">
                      <span className="material-symbols-outlined">thumb_up</span> {skill.endorsements} endorsements
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section className="skill-category">
              <h3><span className="material-symbols-outlined">translate</span> Languages</h3>
              <div className="skills-grid">
                {portfolio.skills.filter(s => s.category === 'language').map((skill, i) => (
                  <div key={i} className="skill-card">
                    <div className="skill-top">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level >= 90 ? 'Native/Fluent' : skill.level >= 70 ? 'Professional' : 'Basic'}</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${skill.level}%`, backgroundColor: getSkillColor(skill.level) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      {showAddModal === 'project' && (
        <div className="modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">add</span> Add Project</h2>
              <button className="btn-close" onClick={() => setShowAddModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Title *</label>
                <input 
                  type="text" 
                  value={newProject.title} 
                  onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., E-Commerce Platform"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={newProject.description} 
                  onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Technologies (comma-separated)</label>
                <input 
                  type="text" 
                  value={newProject.technologies?.join(', ')} 
                  onChange={(e) => setNewProject(p => ({ ...p, technologies: e.target.value.split(',').map(t => t.trim()) }))}
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={newProject.startDate} 
                    onChange={(e) => setNewProject(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newProject.endDate} 
                    onChange={(e) => setNewProject(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={newProject.featured} 
                    onChange={(e) => setNewProject(p => ({ ...p, featured: e.target.checked }))}
                  />
                  Featured Project
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddProject}>Add Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddModal === 'experience' && (
        <div className="modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">add</span> Add Experience</h2>
              <button className="btn-close" onClick={() => setShowAddModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Job Title *</label>
                <input 
                  type="text" 
                  value={newExperience.title} 
                  onChange={(e) => setNewExperience(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input 
                  type="text" 
                  value={newExperience.company} 
                  onChange={(e) => setNewExperience(p => ({ ...p, company: e.target.value }))}
                  placeholder="e.g., Tech Solutions Zim"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={newExperience.location} 
                    onChange={(e) => setNewExperience(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Harare, Zimbabwe"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={newExperience.type} 
                    onChange={(e) => setNewExperience(p => ({ ...p, type: e.target.value as any }))}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={newExperience.startDate} 
                    onChange={(e) => setNewExperience(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newExperience.endDate} 
                    onChange={(e) => setNewExperience(p => ({ ...p, endDate: e.target.value }))}
                    disabled={newExperience.current}
                  />
                </div>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={newExperience.current} 
                    onChange={(e) => setNewExperience(p => ({ ...p, current: e.target.checked }))}
                  />
                  I currently work here
                </label>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newExperience.description} 
                  onChange={(e) => setNewExperience(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your responsibilities..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Skills Used (comma-separated)</label>
                <input 
                  type="text" 
                  value={newExperience.skills?.join(', ')} 
                  onChange={(e) => setNewExperience(p => ({ ...p, skills: e.target.value.split(',').map(t => t.trim()) }))}
                  placeholder="e.g., JavaScript, React, Team Leadership"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddExperience}>Add Experience</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
