import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './AdminDashboard.scss';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalJobs: number;
  totalQuizzes: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  recentUsers: any[];
}

interface Quiz {
  _id?: string;
  title: string;
  courseId: string;
  moduleId: string;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  xpReward: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: string[];
  description: string;
  requirements: string[];
}

interface Course {
  _id?: string;
  title: string;
  subject: string;
  description: string;
  difficulty: string;
  duration: string;
  xpReward: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'jobs' | 'courses' | 'users' | 'ai-generator'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState<'quiz' | 'job' | 'course' | 'ai-quiz' | 'ai-challenge' | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Form states
  const [quizForm, setQuizForm] = useState<Quiz>({
    title: '',
    courseId: '',
    moduleId: '',
    questions: [],
    timeLimit: 300,
    passingScore: 70,
    xpReward: 50
  });

  const [jobForm, setJobForm] = useState<Job>({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    skills: [],
    description: '',
    requirements: []
  });

  const [courseForm, setCourseForm] = useState<Course>({
    title: '',
    subject: 'programming',
    description: '',
    difficulty: 'beginner',
    duration: '',
    xpReward: 500
  });

  const [aiPrompt, setAiPrompt] = useState({
    topic: '',
    difficulty: 'intermediate',
    numberOfQuestions: 5,
    type: 'quiz',
    language: 'JavaScript'
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
          break;
        case 'quizzes':
          const quizzesRes = await fetch(`${API_URL}/admin/quizzes`, { headers });
          const quizzesData = await quizzesRes.json();
          if (quizzesData.success) setQuizzes(quizzesData.quizzes);
          break;
        case 'jobs':
          const jobsRes = await fetch(`${API_URL}/jobs`);
          const jobsData = await jobsRes.json();
          if (jobsData.success) setJobs(jobsData.jobs);
          break;
        case 'courses':
          const coursesRes = await fetch(`${API_URL}/courses`);
          const coursesData = await coursesRes.json();
          if (coursesData.success) setCourses(coursesData.courses);
          break;
        case 'users':
          const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
          const usersData = await usersRes.json();
          if (usersData.success) setUsers(usersData.users);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/quizzes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(quizForm)
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes([data.quiz, ...quizzes]);
        setShowModal(null);
        setQuizForm({
          title: '',
          courseId: '',
          moduleId: '',
          questions: [],
          timeLimit: 300,
          passingScore: 70,
          xpReward: 50
        });
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleCreateJob = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(jobForm)
      });
      const data = await res.json();
      if (data.success) {
        setJobs([data.job, ...jobs]);
        setShowModal(null);
        setJobForm({
          title: '',
          company: '',
          location: '',
          salary: '',
          type: 'Full-time',
          skills: [],
          description: '',
          requirements: []
        });
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/courses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (data.success) {
        setCourses([data.course, ...courses]);
        setShowModal(null);
        setCourseForm({
          title: '',
          subject: 'programming',
          description: '',
          difficulty: 'beginner',
          duration: '',
          xpReward: 500
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    setGeneratedContent(null);
    
    try {
      const endpoint = aiPrompt.type === 'quiz' ? 'generate-quiz' : 'generate-challenge';
      const res = await fetch(`${API_URL}/admin/ai/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(aiPrompt)
      });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedContent(aiPrompt.type === 'quiz' ? data.questions : data.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
    setAiGenerating(false);
  };

  const handleSaveGeneratedQuiz = async () => {
    if (!generatedContent) return;
    
    const newQuiz: Quiz = {
      title: `AI Generated: ${aiPrompt.topic}`,
      courseId: '',
      moduleId: '',
      questions: generatedContent.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      })),
      timeLimit: 300,
      passingScore: 70,
      xpReward: 50
    };

    try {
      const res = await fetch(`${API_URL}/admin/quizzes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newQuiz)
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes([data.quiz, ...quizzes]);
        setShowModal(null);
        setGeneratedContent(null);
        setAiPrompt({
          topic: '',
          difficulty: 'intermediate',
          numberOfQuestions: 5,
          type: 'quiz',
          language: 'JavaScript'
        });
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const handleDeleteItem = async (type: 'quiz' | 'job' | 'course', id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = type === 'quiz' ? 'quizzes' : type === 'job' ? 'jobs' : 'courses';
      await fetch(`${API_URL}/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (type === 'quiz') setQuizzes(quizzes.filter(q => q._id !== id));
      if (type === 'job') setJobs(jobs.filter(j => j._id !== id));
      if (type === 'course') setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <AnimatedBackground variant="matrix" primaryColor="#22c55e" />

      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <span className="material-symbols-outlined logo-icon">settings</span>
            <span className="logo-text">Admin Panel</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="material-symbols-outlined nav-icon">dashboard</span>
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="material-symbols-outlined nav-icon">group</span>
              <span>Users</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <span className="material-symbols-outlined nav-icon">menu_book</span>
              <span>Courses</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              <span className="material-symbols-outlined nav-icon">quiz</span>
              <span>Quizzes</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <span className="material-symbols-outlined nav-icon">work</span>
              <span>Jobs</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'ai-generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-generator')}
            >
              <span className="material-symbols-outlined nav-icon">smart_toy</span>
              <span>AI Generator</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined nav-icon">home</span>
              <span>Back to App</span>
            </button>
            <button className="nav-item logout" onClick={handleLogout}>
              <span className="material-symbols-outlined nav-icon">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content overview-tab">
              <h1>Dashboard Overview</h1>
              
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading statistics...</p>
                </div>
              ) : stats && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon users"><span className="material-symbols-outlined">group</span></div>
                      <div className="stat-info">
                        <span className="stat-value">{stats.totalUsers}</span>
                        <span className="stat-label">Total Users</span>
                      </div>
                      <div className="stat-trend positive">
                        +{stats.newUsersThisMonth} this month
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon courses"><span className="material-symbols-outlined">menu_book</span></div>
                      <div className="stat-info">
                        <span className="stat-value">{stats.totalCourses}</span>
                        <span className="stat-label">Total Courses</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon quizzes"><span className="material-symbols-outlined">quiz</span></div>
                      <div className="stat-info">
                        <span className="stat-value">{stats.totalQuizzes}</span>
                        <span className="stat-label">Total Quizzes</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon jobs"><span className="material-symbols-outlined">work</span></div>
                      <div className="stat-info">
                        <span className="stat-value">{stats.totalJobs}</span>
                        <span className="stat-label">Active Jobs</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon subs">💎</div>
                      <div className="stat-info">
                        <span className="stat-value">{stats.activeSubscriptions}</span>
                        <span className="stat-label">Premium Users</span>
                      </div>
                    </div>
                  </div>

                  <div className="recent-users">
                    <h3>Recent Registrations</h3>
                    <div className="users-list">
                      {stats.recentUsers.map((user, idx) => (
                        <div key={idx} className="user-item">
                          <div className="user-avatar">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                          <span className={`user-role ${user.role}`}>{user.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-content users-tab">
              <div className="tab-header">
                <h1>Manage Users</h1>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                </div>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Level</th>
                        <th>XP</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="user-cell">
                              <div className="avatar">{user.name?.charAt(0) || '?'}</div>
                              {user.name}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                          <td>{user.level || 1}</td>
                          <td>{user.xp || 0} XP</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="tab-content quizzes-tab">
              <div className="tab-header">
                <h1>Manage Quizzes</h1>
                <button className="btn-primary" onClick={() => setShowModal('quiz')}>
                  + Create Quiz
                </button>
              </div>

              {isLoading ? (
                <div className="loading-state"><div className="spinner" /></div>
              ) : (
                <div className="cards-grid">
                  {quizzes.map((quiz, idx) => (
                    <div key={idx} className="content-card">
                      <div className="card-header">
                        <span className="material-symbols-outlined card-icon">quiz</span>
                        <h3>{quiz.title}</h3>
                      </div>
                      <div className="card-body">
                        <p>{quiz.questions?.length || 0} questions</p>
                        <p>Time: {Math.floor(quiz.timeLimit / 60)} min</p>
                        <p>XP Reward: {quiz.xpReward}</p>
                      </div>
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => {}}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteItem('quiz', quiz._id!)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon">edit_note</span>
                      <p>No quizzes yet. Create your first quiz!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="tab-content jobs-tab">
              <div className="tab-header">
                <h1>Manage Jobs</h1>
                <button className="btn-primary" onClick={() => setShowModal('job')}>
                  + Post Job
                </button>
              </div>

              {isLoading ? (
                <div className="loading-state"><div className="spinner" /></div>
              ) : (
                <div className="cards-grid">
                  {jobs.map((job, idx) => (
                    <div key={idx} className="content-card">
                      <div className="card-header">
                        <span className="material-symbols-outlined card-icon">work</span>
                        <h3>{job.title}</h3>
                      </div>
                      <div className="card-body">
                        <p className="company">{job.company}</p>
                        <p>{job.location}</p>
                        <p className="salary">{job.salary}</p>
                        <div className="skills-tags">
                          {job.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => {}}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteItem('job', job._id!)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon">work</span>
                      <p>No jobs posted yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="tab-content courses-tab">
              <div className="tab-header">
                <h1>Manage Courses</h1>
                <button className="btn-primary" onClick={() => setShowModal('course')}>
                  + Create Course
                </button>
              </div>

              {isLoading ? (
                <div className="loading-state"><div className="spinner" /></div>
              ) : (
                <div className="cards-grid">
                  {courses.map((course, idx) => (
                    <div key={idx} className="content-card">
                      <div className="card-header">
                        <span className="material-symbols-outlined card-icon">menu_book</span>
                        <h3>{course.title}</h3>
                      </div>
                      <div className="card-body">
                        <p className="subject">{course.subject}</p>
                        <p>{course.description?.substring(0, 80)}...</p>
                        <div className="course-meta">
                          <span className={`difficulty ${course.difficulty}`}>{course.difficulty}</span>
                          <span className="duration">{course.duration}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => {}}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteItem('course', course._id!)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-icon">menu_book</span>
                      <p>No courses yet. Create your first course!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Generator Tab */}
          {activeTab === 'ai-generator' && (
            <div className="tab-content ai-tab">
              <div className="tab-header">
                <h1><span className="material-symbols-outlined">smart_toy</span> AI Content Generator</h1>
                <p>Use AI to automatically generate quizzes, flashcards, and coding challenges</p>
              </div>

              <div className="ai-generator-container">
                <div className="ai-form">
                  <div className="form-group">
                    <label>Content Type</label>
                    <select
                      value={aiPrompt.type}
                      onChange={(e) => setAiPrompt({ ...aiPrompt, type: e.target.value })}
                    >
                      <option value="quiz">Quiz (Multiple Choice)</option>
                      <option value="flashcard">Flashcards</option>
                      <option value="code">Coding Challenge</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Topic</label>
                    <input
                      type="text"
                      placeholder="e.g., Python Loops, React Hooks, Machine Learning Basics"
                      value={aiPrompt.topic}
                      onChange={(e) => setAiPrompt({ ...aiPrompt, topic: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        value={aiPrompt.difficulty}
                        onChange={(e) => setAiPrompt({ ...aiPrompt, difficulty: e.target.value })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {aiPrompt.type === 'quiz' && (
                      <div className="form-group">
                        <label>Number of Questions</label>
                        <input
                          type="number"
                          min="3"
                          max="20"
                          value={aiPrompt.numberOfQuestions}
                          onChange={(e) => setAiPrompt({ ...aiPrompt, numberOfQuestions: parseInt(e.target.value) })}
                        />
                      </div>
                    )}

                    {aiPrompt.type === 'code' && (
                      <div className="form-group">
                        <label>Programming Language</label>
                        <select
                          value={aiPrompt.language}
                          onChange={(e) => setAiPrompt({ ...aiPrompt, language: e.target.value })}
                        >
                          <option value="JavaScript">JavaScript</option>
                          <option value="Python">Python</option>
                          <option value="TypeScript">TypeScript</option>
                          <option value="Java">Java</option>
                          <option value="C++">C++</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-generate"
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt.topic || aiGenerating}
                  >
                    {aiGenerating ? (
                      <>
                        <span className="spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        🪄 Generate with AI
                      </>
                    )}
                  </button>
                </div>

                {generatedContent && (
                  <div className="ai-preview">
                    <h3>Generated Content Preview</h3>
                    <div className="preview-content">
                      {aiPrompt.type === 'quiz' && Array.isArray(generatedContent) && (
                        <div className="quiz-preview">
                          {generatedContent.map((q: any, idx: number) => (
                            <div key={idx} className="question-preview">
                              <p className="question-text">{idx + 1}. {q.question}</p>
                              <ul className="options-list">
                                {q.options?.map((opt: string, i: number) => (
                                  <li key={i} className={i === q.correctIndex ? 'correct' : ''}>
                                    {opt}
                                  </li>
                                ))}
                              </ul>
                              {q.explanation && (
                                <p className="explanation"><span className="material-symbols-outlined">lightbulb</span> {q.explanation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {aiPrompt.type === 'flashcard' && Array.isArray(generatedContent) && (
                        <div className="flashcards-preview">
                          {generatedContent.map((card: any, idx: number) => (
                            <div key={idx} className="flashcard-preview">
                              <div className="front">{card.front}</div>
                              <div className="back">{card.back}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiPrompt.type === 'code' && generatedContent && (
                        <div className="code-preview">
                          <h4>{generatedContent.title}</h4>
                          <p>{generatedContent.description}</p>
                          <pre><code>{generatedContent.starterCode}</code></pre>
                        </div>
                      )}
                    </div>

                    <div className="preview-actions">
                      <button className="btn-secondary" onClick={() => setGeneratedContent(null)}>
                        Discard
                      </button>
                      <button className="btn-primary" onClick={handleSaveGeneratedQuiz}>
                        Save Content
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showModal === 'quiz' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Quiz</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time Limit (seconds)</label>
                  <input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>XP Reward</label>
                  <input
                    type="number"
                    value={quizForm.xpReward}
                    onChange={(e) => setQuizForm({ ...quizForm, xpReward: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <p className="tip"><span className="material-symbols-outlined">lightbulb</span> Use the AI Generator to create questions automatically!</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateQuiz}>Create Quiz</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'job' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Post New Job</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g., Junior Web Developer"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    placeholder="Company name"
                  />
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
              <div className="form-row">
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="e.g., $500-800/month"
                  />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateJob}>Post Job</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'course' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Course</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={courseForm.subject}
                    onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                  >
                    <option value="programming">Programming</option>
                    <option value="ai">AI & Machine Learning</option>
                    <option value="physics">Physics</option>
                    <option value="math">Mathematics</option>
                    <option value="data-science">Data Science</option>
                    <option value="web-dev">Web Development</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div className="form-group">
                  <label>XP Reward</label>
                  <input
                    type="number"
                    value={courseForm.xpReward}
                    onChange={(e) => setCourseForm({ ...courseForm, xpReward: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Course description..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateCourse}>Create Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
