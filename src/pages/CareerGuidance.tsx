import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './CareerGuidance.scss';

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  milestones: { id: string; title: string; completed: boolean }[];
}

interface LearningHabit {
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  insight: string;
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  skills: string[];
  courses: string[];
  averageSalary: string;
  demandLevel: 'high' | 'medium' | 'low';
}

export default function CareerGuidance() {
  const navigate = useNavigate();
  
  // AI Advisor uses simulated responses (no LiveAPI dependency)
  const [isAiConnected, setIsAiConnected] = useState(false);
  
  const userName = localStorage.getItem('userName') || 'User';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'paths' | 'habits' | 'ai-advisor'>('overview');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([
    {
      id: '1',
      title: 'Become a Full Stack Developer',
      description: 'Master both frontend and backend technologies to become a versatile developer',
      targetDate: '2025-06-30',
      progress: 45,
      milestones: [
        { id: 'm1', title: 'Complete HTML/CSS fundamentals', completed: true },
        { id: 'm2', title: 'Master JavaScript', completed: true },
        { id: 'm3', title: 'Learn React framework', completed: false },
        { id: 'm4', title: 'Backend with Node.js', completed: false },
        { id: 'm5', title: 'Database management', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Get First Tech Job',
      description: 'Land a junior developer position at a reputable company',
      targetDate: '2025-03-31',
      progress: 30,
      milestones: [
        { id: 'm1', title: 'Build portfolio website', completed: true },
        { id: 'm2', title: 'Complete 3 projects', completed: false },
        { id: 'm3', title: 'Prepare CV', completed: false },
        { id: 'm4', title: 'Practice interviews', completed: false },
      ],
    },
  ]);

  const [learningHabits, setLearningHabits] = useState<LearningHabit[]>([
    { metric: 'Daily Study Time', value: '2.5 hrs', trend: 'up', insight: 'Great improvement! You\'ve increased your study time by 30% this week.' },
    { metric: 'Courses Completed', value: 5, trend: 'stable', insight: 'Consistent progress. Consider challenging yourself with more advanced courses.' },
    { metric: 'Practice Sessions', value: 12, trend: 'up', insight: 'Excellent coding practice! Hands-on experience is key to mastery.' },
    { metric: 'Quiz Score Average', value: '85%', trend: 'stable', insight: 'Strong understanding. Focus on areas where you score below 80%.' },
    { metric: 'Weekly Streak', value: '6 weeks', trend: 'up', insight: 'Amazing consistency! Keep up the momentum.' },
    { metric: 'Skills Gained', value: 8, trend: 'up', insight: 'You\'re expanding your skill set rapidly. Great work!' },
  ]);

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([
    {
      id: '1',
      title: 'Full Stack Web Developer',
      description: 'Build complete web applications from frontend to backend, managing databases and APIs.',
      matchScore: 92,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
      courses: ['Web Development Essentials', 'React Mastery', 'Node.js Backend'],
      averageSalary: '$800 - $2000/month',
      demandLevel: 'high',
    },
    {
      id: '2',
      title: 'Data Analyst',
      description: 'Analyze data to help organizations make informed decisions using statistical tools.',
      matchScore: 78,
      skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
      courses: ['Python for Data Science', 'SQL Fundamentals', 'Data Visualization'],
      averageSalary: '$700 - $1500/month',
      demandLevel: 'high',
    },
    {
      id: '3',
      title: 'Mobile App Developer',
      description: 'Create mobile applications for iOS and Android platforms.',
      matchScore: 65,
      skills: ['React Native', 'Flutter', 'JavaScript', 'Mobile UI/UX'],
      courses: ['React Native Essentials', 'Mobile Development Fundamentals'],
      averageSalary: '$900 - $2200/month',
      demandLevel: 'medium',
    },
    {
      id: '4',
      title: 'AI/ML Engineer',
      description: 'Develop machine learning models and AI-powered applications.',
      matchScore: 55,
      skills: ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning'],
      courses: ['AI Fundamentals', 'Machine Learning with Python'],
      averageSalary: '$1200 - $3000/month',
      demandLevel: 'high',
    },
  ]);

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' });

  // AI Voice Advisor Functions (simulated - no external API dependency)
  const startVoiceConversation = async () => {
    setIsAiConnected(true);
    setIsListening(true);
    setTranscript([]);
    setAiResponse('');
  };

  const stopVoiceConversation = () => {
    setIsListening(false);
    setIsAiConnected(false);
  };

  const simulateAIResponse = (userInput: string) => {
    setIsThinking(true);
    setTimeout(() => {
      const responses: Record<string, string> = {
        career: `Based on your learning patterns and completed courses, I recommend focusing on Full Stack Development. You've shown strong aptitude in JavaScript and are making good progress in React. To accelerate your career path:
        
1. Complete the React Mastery course this month
2. Build 2-3 portfolio projects showcasing your skills
3. Start networking on LinkedIn and local tech meetups
4. Consider freelance projects on the U2M marketplace to gain real-world experience`,
        
        skills: `Looking at your skill progression, here's my analysis:

Strengths: JavaScript (85%), Problem Solving (90%), HTML/CSS (92%)
Areas to Improve: Backend development, Database management

I suggest dedicating 30% of your study time to Node.js and MongoDB. This will round out your full stack capabilities and make you more competitive in the job market.`,
        
        habits: `Your learning habits are impressive! Here's what the data shows:

- You study most effectively between 6-8 PM
- Your quiz scores are highest after practical exercises
- You've maintained a 6-week streak!

Recommendation: Incorporate more hands-on coding challenges. Your retention improves 40% with practical application.`,
        
        default: `I'm here to help guide your career journey! I can help you with:

• Analyzing your learning patterns
• Suggesting career paths based on your skills
• Creating personalized study plans
• Preparing for job interviews
• Building your professional portfolio

What would you like to explore today?`,
      };

      const keyword = Object.keys(responses).find(key => 
        userInput.toLowerCase().includes(key)
      ) || 'default';
      
      setAiResponse(responses[keyword]);
      setIsThinking(false);
    }, 2000);
  };

  const handleAddGoal = () => {
    const goal: CareerGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      progress: 0,
      milestones: [],
    };
    setCareerGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', description: '', targetDate: '' });
    setShowAddGoalModal(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setCareerGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);
        return { ...goal, milestones: updatedMilestones, progress };
      }
      return goal;
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#22c55e';
      case 'down': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'high': return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)', text: 'High Demand' };
      case 'medium': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: 'Medium Demand' };
      default: return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)', text: 'Low Demand' };
    }
  };

  return (
    <div className="career-guidance-page">
      <AnimatedBackground variant="gradient" primaryColor="#10b981" secondaryColor="#1e1b4b" />
      
      {/* Header */}
      <header className="career-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined">arrow_back</span> Back
        </button>
        <h1><span className="material-symbols-outlined">trending_up</span> Career Guidance</h1>
        <p className="subtitle">AI-Powered Career Counseling & Planning</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="career-nav">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'goals', label: 'Goals', icon: 'flag' },
          { id: 'paths', label: 'Career Paths', icon: 'route' },
          { id: 'habits', label: 'Learning Habits', icon: 'insights' },
          { id: 'ai-advisor', label: 'AI Advisor', icon: 'smart_toy' },
        ].map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="career-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Welcome Card */}
            <section className="welcome-card">
              <div className="welcome-content">
                <h2>Welcome, {userName}!</h2>
                <p>Your personalized career dashboard shows your progress, goals, and recommendations powered by AI analysis of your learning patterns.</p>
              </div>
              <button className="btn-ai-chat" onClick={() => setActiveTab('ai-advisor')}>
                <span className="material-symbols-outlined">record_voice_over</span>
                Talk to AI Advisor
              </button>
            </section>

            {/* Quick Stats */}
            <section className="quick-stats">
              <div className="stat-card">
                <span className="material-symbols-outlined">flag</span>
                <div className="stat-info">
                  <span className="value">{careerGoals.length}</span>
                  <span className="label">Active Goals</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="material-symbols-outlined">check_circle</span>
                <div className="stat-info">
                  <span className="value">{careerGoals.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0)}</span>
                  <span className="label">Milestones Done</span>
                </div>
              </div>
              <div className="stat-card highlight">
                <span className="material-symbols-outlined">local_fire_department</span>
                <div className="stat-info">
                  <span className="value">6 weeks</span>
                  <span className="label">Learning Streak</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="material-symbols-outlined">psychology</span>
                <div className="stat-info">
                  <span className="value">92%</span>
                  <span className="label">Career Match</span>
                </div>
              </div>
            </section>

            {/* Top Career Match */}
            <section className="top-match-card">
              <h3><span className="material-symbols-outlined">stars</span> Your Top Career Match</h3>
              <div className="match-content">
                <div className="match-info">
                  <h4>{careerPaths[0].title}</h4>
                  <p>{careerPaths[0].description}</p>
                  <div className="match-skills">
                    {careerPaths[0].skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="match-score">
                  <div className="score-circle">
                    <span className="score">{careerPaths[0].matchScore}%</span>
                    <span className="label">Match</span>
                  </div>
                </div>
              </div>
              <button className="btn-explore" onClick={() => setActiveTab('paths')}>
                Explore Career Paths <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </section>

            {/* Current Goals Summary */}
            <section className="goals-summary">
              <div className="section-header">
                <h3><span className="material-symbols-outlined">flag</span> Current Goals</h3>
                <button onClick={() => setActiveTab('goals')}>View All</button>
              </div>
              <div className="goals-list">
                {careerGoals.slice(0, 2).map(goal => (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-info">
                      <h4>{goal.title}</h4>
                      <span className="target">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="progress-text">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Insight */}
            <section className="ai-insight-card">
              <div className="insight-icon">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div className="insight-content">
                <h4>AI Insight</h4>
                <p>Based on your learning patterns, you perform best in the evenings. Consider scheduling your most challenging study sessions between 6-8 PM for optimal retention.</p>
              </div>
            </section>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="tab-header">
              <h2><span className="material-symbols-outlined">flag</span> Career Goals</h2>
              <button className="btn-add" onClick={() => setShowAddGoalModal(true)}>
                <span className="material-symbols-outlined">add</span> Add Goal
              </button>
            </div>

            <div className="goals-grid">
              {careerGoals.map(goal => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h3>{goal.title}</h3>
                    <div className="progress-badge">{goal.progress}%</div>
                  </div>
                  <p className="goal-description">{goal.description}</p>
                  
                  <div className="goal-progress-section">
                    <div className="progress-bar-large">
                      <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <span className="target-date">
                      <span className="material-symbols-outlined">event</span>
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="milestones">
                    <h4>Milestones</h4>
                    {goal.milestones.map(milestone => (
                      <div 
                        key={milestone.id} 
                        className={`milestone-item ${milestone.completed ? 'completed' : ''}`}
                        onClick={() => toggleMilestone(goal.id, milestone.id)}
                      >
                        <span className="material-symbols-outlined">
                          {milestone.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>{milestone.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Paths Tab */}
        {activeTab === 'paths' && (
          <div className="paths-tab">
            <div className="tab-header">
              <h2><span className="material-symbols-outlined">route</span> Career Paths</h2>
              <p>Based on your skills, learning progress, and interests</p>
            </div>

            <div className="paths-list">
              {careerPaths.map(path => {
                const demand = getDemandBadge(path.demandLevel);
                return (
                  <div key={path.id} className="path-card">
                    <div className="path-header">
                      <div className="path-info">
                        <h3>{path.title}</h3>
                        <span 
                          className="demand-badge"
                          style={{ background: demand.bg, color: demand.color }}
                        >
                          {demand.text}
                        </span>
                      </div>
                      <div className="match-score">
                        <svg viewBox="0 0 36 36" className="score-ring">
                          <path
                            className="ring-bg"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="ring-fill"
                            strokeDasharray={`${path.matchScore}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="score-text">{path.matchScore}%</span>
                      </div>
                    </div>
                    
                    <p className="path-description">{path.description}</p>
                    
                    <div className="path-salary">
                      <span className="material-symbols-outlined">payments</span>
                      Expected: {path.averageSalary}
                    </div>

                    <div className="path-skills">
                      <h4>Required Skills</h4>
                      <div className="skills-tags">
                        {path.skills.map((skill, i) => (
                          <span key={i} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="path-courses">
                      <h4>Recommended Courses</h4>
                      <div className="courses-list">
                        {path.courses.map((course, i) => (
                          <span key={i} className="course-item">
                            <span className="material-symbols-outlined">play_circle</span>
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="btn-start-path" onClick={() => navigate('/learn')}>
                      Start This Path <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Habits Tab */}
        {activeTab === 'habits' && (
          <div className="habits-tab">
            <div className="tab-header">
              <h2><span className="material-symbols-outlined">insights</span> Learning Habits Analysis</h2>
              <p>Track your learning patterns and get AI-powered insights</p>
            </div>

            <div className="habits-grid">
              {learningHabits.map((habit, i) => (
                <div key={i} className="habit-card">
                  <div className="habit-header">
                    <span className="metric-name">{habit.metric}</span>
                    <span 
                      className="trend-icon"
                      style={{ color: getTrendColor(habit.trend) }}
                    >
                      <span className="material-symbols-outlined">{getTrendIcon(habit.trend)}</span>
                    </span>
                  </div>
                  <div className="metric-value">{habit.value}</div>
                  <p className="habit-insight">{habit.insight}</p>
                </div>
              ))}
            </div>

            {/* Weekly Activity Chart Placeholder */}
            <section className="activity-chart">
              <h3><span className="material-symbols-outlined">bar_chart</span> Weekly Activity</h3>
              <div className="chart-placeholder">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="bar-container">
                    <div 
                      className="bar" 
                      style={{ height: `${[60, 80, 45, 90, 70, 100, 55][i]}%` }}
                    />
                    <span className="day-label">{day}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* AI Advisor Tab */}
        {activeTab === 'ai-advisor' && (
          <div className="ai-advisor-tab">
            <div className="advisor-header">
              <div className="advisor-avatar">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div className="advisor-info">
                <h2>AI Career Advisor</h2>
                <p>Powered by Gemini Live - Voice-enabled career guidance</p>
              </div>
            </div>

            <div className="advisor-chat">
              {/* Quick Actions */}
              <div className="quick-actions">
                <h4>Ask me about:</h4>
                <div className="action-buttons">
                  <button onClick={() => simulateAIResponse('career path recommendation')}>
                    <span className="material-symbols-outlined">route</span>
                    Career Path
                  </button>
                  <button onClick={() => simulateAIResponse('skills analysis')}>
                    <span className="material-symbols-outlined">psychology</span>
                    Skills Analysis
                  </button>
                  <button onClick={() => simulateAIResponse('learning habits improvement')}>
                    <span className="material-symbols-outlined">insights</span>
                    Learning Habits
                  </button>
                  <button onClick={() => navigate('/portfolio')}>
                    <span className="material-symbols-outlined">person</span>
                    Build Portfolio
                  </button>
                  <button onClick={() => navigate('/cv-generator')}>
                    <span className="material-symbols-outlined">description</span>
                    Generate CV
                  </button>
                </div>
              </div>

              {/* Voice Interaction */}
              <div className="voice-section">
                <h4>Voice Conversation</h4>
                <p className="voice-description">
                  Start a voice conversation with your AI advisor. Speak naturally about your career goals, 
                  challenges, and aspirations.
                </p>
                
                <button 
                  className={`btn-voice ${isListening ? 'listening' : ''}`}
                  onClick={isListening ? stopVoiceConversation : startVoiceConversation}
                >
                  <span className="material-symbols-outlined">
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                  {isListening ? 'Stop Listening' : 'Start Voice Chat'}
                </button>

                {isListening && (
                  <div className="voice-indicator">
                    <div className="pulse" />
                    <span>Listening...</span>
                  </div>
                )}
              </div>

              {/* AI Response */}
              {(isThinking || aiResponse) && (
                <div className="ai-response">
                  <div className="response-header">
                    <span className="material-symbols-outlined">smart_toy</span>
                    AI Advisor
                  </div>
                  {isThinking ? (
                    <div className="thinking">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  ) : (
                    <div className="response-content">
                      {aiResponse.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text Input Alternative */}
              <div className="text-input-section">
                <input 
                  type="text" 
                  placeholder="Or type your question here..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      simulateAIResponse(e.currentTarget.value);
                      setTranscript(prev => [...prev, e.currentTarget.value]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button className="btn-send">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="modal-overlay" onClick={() => setShowAddGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">add</span> Add Career Goal</h2>
              <button className="btn-close" onClick={() => setShowAddGoalModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Goal Title *</label>
                <input 
                  type="text" 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Become a Data Scientist"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input 
                  type="date" 
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddGoalModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddGoal}>Add Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
