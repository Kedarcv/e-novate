import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './ClientPortal.scss';

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary: string;
  type: string;
  location: string;
  status: 'active' | 'paused' | 'closed';
  applicants: number;
  createdAt: string;
}

interface Project {
  _id: string;
  jobId: string;
  jobTitle: string;
  assignedDeveloper: {
    name: string;
    email: string;
    avatar: string;
  } | null;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  progress: number;
  milestones: {
    title: string;
    completed: boolean;
    dueDate: string;
  }[];
  updates: {
    message: string;
    from: 'admin' | 'developer';
    date: string;
  }[];
  budget: string;
  startDate: string;
  estimatedCompletion: string;
}

interface Message {
  _id: string;
  subject: string;
  content: string;
  from: 'admin' | 'client';
  read: boolean;
  createdAt: string;
  projectId?: string;
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'projects' | 'messages'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('authToken');
  const userName = localStorage.getItem('userName') || 'Client';

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    salary: '',
    type: 'full-time',
    location: ''
  });

  useEffect(() => {
    // Check if user is client
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'client' && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch client's jobs
      const jobsRes = await fetch(`${API_URL}/client/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      if (jobsData.success) setJobs(jobsData.jobs || []);

      // Fetch client's projects
      const projectsRes = await fetch(`${API_URL}/client/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();
      if (projectsData.success) setProjects(projectsData.projects || []);

      // Fetch messages from admin
      const messagesRes = await fetch(`${API_URL}/client/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const messagesData = await messagesRes.json();
      if (messagesData.success) setMessages(messagesData.messages || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Set mock data for demo
      setJobs([
        {
          _id: '1',
          title: 'Junior Python Developer',
          company: userName,
          description: 'Looking for a Python developer to help build our backend systems...',
          requirements: ['Python', 'Django'],
          skills: ['Python', 'Django', 'SQL'],
          salary: '$800-1200/month',
          type: 'full-time',
          location: 'Remote',
          status: 'active',
          applicants: 12,
          createdAt: new Date().toISOString()
        }
      ]);
      setProjects([
        {
          _id: '1',
          jobId: '1',
          jobTitle: 'E-commerce Website Development',
          assignedDeveloper: {
            name: 'John Developer',
            email: 'john@example.com',
            avatar: 'person'
          },
          status: 'in-progress',
          progress: 65,
          milestones: [
            { title: 'Design Approval', completed: true, dueDate: '2024-01-15' },
            { title: 'Frontend Development', completed: true, dueDate: '2024-01-30' },
            { title: 'Backend Integration', completed: false, dueDate: '2024-02-15' },
            { title: 'Testing & Launch', completed: false, dueDate: '2024-02-28' }
          ],
          updates: [
            { message: 'Project started. Developer assigned.', from: 'admin', date: '2024-01-10' },
            { message: 'Frontend development completed ahead of schedule!', from: 'admin', date: '2024-01-28' }
          ],
          budget: '$2,500',
          startDate: '2024-01-10',
          estimatedCompletion: '2024-02-28'
        }
      ]);
      setMessages([
        {
          _id: '1',
          subject: 'Project Update: E-commerce Website',
          content: 'Your project is progressing well. The frontend has been completed and we are now working on backend integration. The developer is making great progress!',
          from: 'admin',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }
    setIsLoading(false);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/client/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...jobForm,
          requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
          skills: jobForm.skills.split(',').map(s => s.trim()).filter(s => s)
        })
      });
      const data = await res.json();
      if (data.success) {
        setJobs([data.job, ...jobs]);
        setShowJobForm(false);
        resetJobForm();
        alert('Job posted successfully! Our admin will review and publish it shortly.');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      // Demo mode - add locally
      const newJob: Job = {
        _id: Date.now().toString(),
        title: jobForm.title,
        company: userName,
        description: jobForm.description,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
        skills: jobForm.skills.split(',').map(s => s.trim()).filter(s => s),
        salary: jobForm.salary,
        type: jobForm.type,
        location: jobForm.location,
        status: 'active',
        applicants: 0,
        createdAt: new Date().toISOString()
      };
      setJobs([newJob, ...jobs]);
      setShowJobForm(false);
      resetJobForm();
      alert('Job posted successfully! Our admin will review and publish it shortly.');
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      skills: '',
      salary: '',
      type: 'full-time',
      location: ''
    });
  };

  const sendMessageToAdmin = async () => {
    if (!newMessage.trim()) return;
    try {
      await fetch(`${API_URL}/client/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: selectedProject ? `Re: ${selectedProject.jobTitle}` : 'General Inquiry',
          content: newMessage,
          projectId: selectedProject?._id
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
    // Add to local messages
    const msg: Message = {
      _id: Date.now().toString(),
      subject: selectedProject ? `Re: ${selectedProject.jobTitle}` : 'General Inquiry',
      content: newMessage,
      from: 'client',
      read: true,
      createdAt: new Date().toISOString(),
      projectId: selectedProject?._id
    };
    setMessages([msg, ...messages]);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'review': return '#8b5cf6';
      case 'completed': return '#22c55e';
      case 'active': return '#22c55e';
      case 'paused': return '#f59e0b';
      case 'closed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const unreadMessages = messages.filter(m => !m.read && m.from === 'admin').length;

  return (
    <div className="client-portal">
      <AnimatedBackground variant="geometric" primaryColor="#3b82f6" secondaryColor="#1e293b" />

      {/* Header */}
      <header className="portal-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <div className="portal-title">
            <span className="icon">🏢</span>
            <h1>Client Portal</h1>
          </div>
        </div>
        <div className="header-right">
          <span className="welcome">Welcome, {userName}</span>
          {unreadMessages > 0 && (
            <span className="notification-badge">{unreadMessages} new</span>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="portal-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
        >
          <span className="material-symbols-outlined">assignment</span> My Jobs ({jobs.length})
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          <span className="material-symbols-outlined">rocket_launch</span> Projects ({projects.length})
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => setActiveTab('messages')}
        >
          <span className="material-symbols-outlined">chat</span> Messages {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
        </button>
        <button 
          className="btn-post-job"
          onClick={() => setShowJobForm(true)}
        >
          <span className="material-symbols-outlined">add</span> Post New Job
        </button>
      </nav>

      <main className="portal-content">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-view">
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="material-symbols-outlined stat-icon">assignment</span>
                    <div className="stat-info">
                      <span className="stat-value">{jobs.length}</span>
                      <span className="stat-label">Active Jobs</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="material-symbols-outlined stat-icon">group</span>
                    <div className="stat-info">
                      <span className="stat-value">{jobs.reduce((sum, j) => sum + j.applicants, 0)}</span>
                      <span className="stat-label">Total Applicants</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="material-symbols-outlined stat-icon">rocket_launch</span>
                    <div className="stat-info">
                      <span className="stat-value">{projects.filter(p => p.status === 'in-progress').length}</span>
                      <span className="stat-label">Active Projects</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="material-symbols-outlined stat-icon">check_circle</span>
                    <div className="stat-info">
                      <span className="stat-value">{projects.filter(p => p.status === 'completed').length}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-sections">
                  <section className="recent-projects">
                    <h2><span className="material-symbols-outlined">rocket_launch</span> Active Projects</h2>
                    {projects.filter(p => p.status !== 'completed').length === 0 ? (
                      <p className="empty-state">No active projects. Post a job to get started!</p>
                    ) : (
                      projects.filter(p => p.status !== 'completed').map(project => (
                        <div key={project._id} className="project-card" onClick={() => {
                          setSelectedProject(project);
                          setActiveTab('projects');
                        }}>
                          <div className="project-header">
                            <h3>{project.jobTitle}</h3>
                            <span className="status" style={{ backgroundColor: getStatusColor(project.status) }}>
                              {project.status}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="progress-text">{project.progress}% Complete</span>
                          {project.assignedDeveloper && (
                            <div className="developer-info">
                              <span className="avatar">{project.assignedDeveloper.avatar}</span>
                              <span>{project.assignedDeveloper.name}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </section>

                  <section className="recent-messages">
                    <h2><span className="material-symbols-outlined">chat</span> Recent Messages from Admin</h2>
                    {messages.filter(m => m.from === 'admin').slice(0, 3).length === 0 ? (
                      <p className="empty-state">No messages yet.</p>
                    ) : (
                      messages.filter(m => m.from === 'admin').slice(0, 3).map(msg => (
                        <div key={msg._id} className={`message-preview ${!msg.read ? 'unread' : ''}`}>
                          <div className="message-header">
                            <span className="subject">{msg.subject}</span>
                            <span className="date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="content">{msg.content.substring(0, 100)}...</p>
                        </div>
                      ))
                    )}
                  </section>
                </div>

                <div className="info-banner">
                  <span className="material-symbols-outlined info-icon">info</span>
                  <div className="info-content">
                    <h3>How It Works</h3>
                    <p>1. <strong>Post a job</strong> - Describe your project requirements</p>
                    <p>2. <strong>Admin reviews</strong> - Our admin matches you with the best developer</p>
                    <p>3. <strong>Track progress</strong> - Monitor your project through this portal</p>
                    <p>4. <strong>Communicate</strong> - All communication goes through the admin for quality assurance</p>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs View */}
            {activeTab === 'jobs' && (
              <div className="jobs-view">
                <div className="view-header">
                  <h2><span className="material-symbols-outlined">assignment</span> My Posted Jobs</h2>
                  <button className="btn-post" onClick={() => setShowJobForm(true)}>
                    <span className="material-symbols-outlined">add</span> Post New Job
                  </button>
                </div>
                {jobs.length === 0 ? (
                  <div className="empty-state-large">
                    <span className="material-symbols-outlined icon">assignment</span>
                    <h3>No jobs posted yet</h3>
                    <p>Post your first job to start finding talented developers!</p>
                    <button onClick={() => setShowJobForm(true)}>Post a Job</button>
                  </div>
                ) : (
                  <div className="jobs-list">
                    {jobs.map(job => (
                      <div key={job._id} className="job-card">
                        <div className="job-header">
                          <h3>{job.title}</h3>
                          <span className="status" style={{ backgroundColor: getStatusColor(job.status) }}>
                            {job.status}
                          </span>
                        </div>
                        <p className="description">{job.description.substring(0, 150)}...</p>
                        <div className="job-details">
                          <span><span className="material-symbols-outlined">location_on</span> {job.location}</span>
                          <span><span className="material-symbols-outlined">work</span> {job.type}</span>
                          <span><span className="material-symbols-outlined">payments</span> {job.salary}</span>
                        </div>
                        <div className="job-skills">
                          {job.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                        <div className="job-footer">
                          <span className="applicants">👥 {job.applicants} applicants</span>
                          <span className="date">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects View */}
            {activeTab === 'projects' && (
              <div className="projects-view">
                <h2><span className="material-symbols-outlined">rocket_launch</span> My Projects</h2>
                {selectedProject ? (
                  <div className="project-detail">
                    <button className="btn-back-small" onClick={() => setSelectedProject(null)}>
                      ← Back to Projects
                    </button>
                    <div className="project-header-detail">
                      <h3>{selectedProject.jobTitle}</h3>
                      <span className="status" style={{ backgroundColor: getStatusColor(selectedProject.status) }}>
                        {selectedProject.status}
                      </span>
                    </div>

                    <div className="project-info-grid">
                      <div className="info-card">
                        <h4>Progress</h4>
                        <div className="progress-bar large">
                          <div className="progress-fill" style={{ width: `${selectedProject.progress}%` }}></div>
                        </div>
                        <span className="progress-text">{selectedProject.progress}% Complete</span>
                      </div>

                      {selectedProject.assignedDeveloper && (
                        <div className="info-card">
                          <h4>Assigned Developer</h4>
                          <div className="developer-card">
                            <span className="material-symbols-outlined avatar-large">{selectedProject.assignedDeveloper.avatar}</span>
                            <div>
                              <span className="name">{selectedProject.assignedDeveloper.name}</span>
                              <span className="email">{selectedProject.assignedDeveloper.email}</span>
                            </div>
                          </div>
                          <p className="note"><span className="material-symbols-outlined">lightbulb</span> All communication with the developer goes through our admin to ensure quality.</p>
                        </div>
                      )}

                      <div className="info-card">
                        <h4>Project Details</h4>
                        <div className="details-list">
                          <div><span>Budget:</span> <strong>{selectedProject.budget}</strong></div>
                          <div><span>Started:</span> <strong>{selectedProject.startDate}</strong></div>
                          <div><span>Est. Completion:</span> <strong>{selectedProject.estimatedCompletion}</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="milestones-section">
                      <h4>📌 Milestones</h4>
                      <div className="milestones-list">
                        {selectedProject.milestones.map((milestone, i) => (
                          <div key={i} className={`milestone ${milestone.completed ? 'completed' : ''}`}>
                            <span className="material-symbols-outlined milestone-icon">{milestone.completed ? 'check_circle' : 'schedule'}</span>
                            <div className="milestone-info">
                              <span className="title">{milestone.title}</span>
                              <span className="date">Due: {milestone.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="updates-section">
                      <h4><span className="material-symbols-outlined">assignment</span> Project Updates (from Admin)</h4>
                      <div className="updates-list">
                        {selectedProject.updates.map((update, i) => (
                          <div key={i} className="update-item">
                            <span className="update-date">{update.date}</span>
                            <p className="update-message">{update.message}</p>
                            <span className="update-from">— {update.from === 'admin' ? 'Admin' : 'Developer'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="message-section">
                      <h4><span className="material-symbols-outlined">chat</span> Send Message to Admin</h4>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message to the admin about this project..."
                        rows={4}
                      />
                      <button className="btn-send" onClick={sendMessageToAdmin}>
                        Send Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {projects.length === 0 ? (
                      <div className="empty-state-large">
                        <span className="material-symbols-outlined icon">rocket_launch</span>
                        <h3>No projects yet</h3>
                        <p>Once you post a job and our admin assigns a developer, your project will appear here.</p>
                      </div>
                    ) : (
                      <div className="projects-grid">
                        {projects.map(project => (
                          <div key={project._id} className="project-card-large" onClick={() => setSelectedProject(project)}>
                            <div className="project-header">
                              <h3>{project.jobTitle}</h3>
                              <span className="status" style={{ backgroundColor: getStatusColor(project.status) }}>
                                {project.status}
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <div className="project-meta">
                              <span>{project.progress}% Complete</span>
                              <span>Est: {project.estimatedCompletion}</span>
                            </div>
                            {project.assignedDeveloper && (
                              <div className="developer-info">
                                <span className="avatar">{project.assignedDeveloper.avatar}</span>
                                <span>{project.assignedDeveloper.name}</span>
                              </div>
                            )}
                            <div className="milestones-preview">
                              {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Messages View */}
            {activeTab === 'messages' && (
              <div className="messages-view">
                <h2><span className="material-symbols-outlined">chat</span> Messages</h2>
                <p className="messages-info">All communication with developers goes through our admin team to ensure quality and accountability.</p>
                
                <div className="compose-section">
                  <h3>Send Message to Admin</h3>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                  />
                  <button className="btn-send" onClick={sendMessageToAdmin}>
                    Send Message
                  </button>
                </div>

                <div className="messages-list">
                  {messages.length === 0 ? (
                    <p className="empty-state">No messages yet.</p>
                  ) : (
                    messages.map(msg => (
                      <div key={msg._id} className={`message-card ${msg.from} ${!msg.read ? 'unread' : ''}`}>
                        <div className="message-header">
                          <span className="from">{msg.from === 'admin' ? 'Admin' : 'You'}</span>
                          <span className="date">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <h4 className="subject">{msg.subject}</h4>
                        <p className="content">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Job Posting Modal */}
      {showJobForm && (
        <div className="modal-overlay" onClick={() => setShowJobForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">assignment</span> Post a New Job</h2>
              <button className="btn-close" onClick={() => setShowJobForm(false)}>✕</button>
            </div>
            <form onSubmit={handlePostJob}>
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g., Full-Stack Developer"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g., Remote, Harare"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Budget/Salary</label>
                <input
                  type="text"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  placeholder="e.g., $500-1000/month"
                />
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements (one per line)</label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="2+ years experience&#10;Knowledge of React&#10;Good communication skills"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, Node.js, MongoDB, TypeScript"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowJobForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Post Job
                </button>
              </div>

              <p className="form-note">
                <span className="material-symbols-outlined">lightbulb</span> Your job will be reviewed by our admin before being published. 
                We'll match you with the best candidates from our certified talent pool.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
